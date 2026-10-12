/**
 * Tests des règles de sécurité Firestore (émulateur requis) :
 *   npm run test:rules
 */
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  setLogLevel,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const PROJECT_ID = 'demo-mesbonnesadresses';

let testEnv: RulesTestEnvironment;

const alice = { uid: 'alice', email: 'alice@example.com' };
const bob = { uid: 'bob', email: 'bob@example.com' };

function asUser(user: { uid: string; email: string }) {
  return testEnv.authenticatedContext(user.uid, { email: user.email }).firestore();
}

function asGuest() {
  return testEnv.unauthenticatedContext().firestore();
}

function addressData(overrides: Record<string, unknown> = {}) {
  return {
    ownerId: alice.uid,
    ownerName: 'Alice',
    name: 'Le Petit Bistrot',
    description: 'Très bon',
    isPublic: true,
    latitude: 48.85,
    longitude: 2.35,
    photoURL: null,
    createdAt: serverTimestamp(),
    ...overrides,
  };
}

function reviewData(overrides: Record<string, unknown> = {}) {
  return {
    authorId: bob.uid,
    authorName: 'Bob',
    authorPhotoURL: null,
    rating: 4,
    comment: 'Super adresse',
    photoURL: null,
    createdAt: serverTimestamp(),
    ...overrides,
  };
}

/** Prépare des données en contournant les règles. */
async function seed(path: string, data: Record<string, unknown>) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), path), data);
  });
}

beforeAll(async () => {
  // Les refus attendus sont journalisés par le SDK : on n'affiche que les erreurs
  setLogLevel('error');
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8') },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('users', () => {
  const profile = {
    displayName: 'Alice',
    email: alice.email,
    photoURL: null,
    createdAt: serverTimestamp(),
  };

  it("permet à un utilisateur de créer son propre profil", async () => {
    await assertSucceeds(setDoc(doc(asUser(alice), 'users', alice.uid), profile));
  });

  it("interdit de créer le profil d'un autre utilisateur", async () => {
    await assertFails(setDoc(doc(asUser(bob), 'users', alice.uid), profile));
  });

  it('interdit un e-mail différent de celui du compte', async () => {
    await assertFails(
      setDoc(doc(asUser(alice), 'users', alice.uid), { ...profile, email: 'pirate@example.com' }),
    );
  });

  it('interdit les visiteurs non connectés', async () => {
    await assertFails(setDoc(doc(asGuest(), 'users', alice.uid), profile));
    await assertFails(getDoc(doc(asGuest(), 'users', alice.uid)));
  });

  it('autorise la mise à jour de sa photo de profil uniquement', async () => {
    await seed(`users/${alice.uid}`, { ...profile, createdAt: new Date() });
    await assertSucceeds(
      setDoc(doc(asUser(alice), 'users', alice.uid), { photoURL: 'https://x/y.jpg' }, { merge: true }),
    );
    await assertFails(updateDoc(doc(asUser(alice), 'users', alice.uid), { email: 'autre@example.com' }));
    await assertFails(updateDoc(doc(asUser(bob), 'users', alice.uid), { photoURL: null }));
  });

  it('le profil (et son e-mail) est lisible uniquement par son propriétaire', async () => {
    await seed(`users/${alice.uid}`, { ...profile, createdAt: new Date() });
    await assertSucceeds(getDoc(doc(asUser(alice), 'users', alice.uid)));
    await assertFails(getDoc(doc(asUser(bob), 'users', alice.uid)));
  });

  it('interdit la suppression du profil', async () => {
    await seed(`users/${alice.uid}`, { ...profile, createdAt: new Date() });
    await assertFails(deleteDoc(doc(asUser(alice), 'users', alice.uid)));
  });
});

describe('addresses : création', () => {
  it('permet de créer une adresse publique ou privée à son nom', async () => {
    const db = asUser(alice);
    await assertSucceeds(setDoc(doc(db, 'addresses', 'a1'), addressData()));
    await assertSucceeds(setDoc(doc(db, 'addresses', 'a2'), addressData({ isPublic: false })));
  });

  it("interdit de créer une adresse au nom d'un autre", async () => {
    await assertFails(setDoc(doc(asUser(bob), 'addresses', 'a1'), addressData()));
  });

  it('interdit la création sans être connecté', async () => {
    await assertFails(setDoc(doc(asGuest(), 'addresses', 'a1'), addressData()));
  });

  it('refuse les données invalides', async () => {
    const db = asUser(alice);
    await assertFails(setDoc(doc(db, 'addresses', 'a1'), addressData({ name: '' })));
    await assertFails(setDoc(doc(db, 'addresses', 'a2'), addressData({ name: 'x'.repeat(81) })));
    await assertFails(setDoc(doc(db, 'addresses', 'a3'), addressData({ isPublic: 'oui' })));
    await assertFails(setDoc(doc(db, 'addresses', 'a4'), addressData({ latitude: 120 })));
    await assertFails(setDoc(doc(db, 'addresses', 'a5'), addressData({ admin: true })));
    await assertFails(
      setDoc(doc(db, 'addresses', 'a6'), addressData({ description: 'x'.repeat(501) })),
    );
  });
});

describe('addresses : lecture', () => {
  beforeEach(async () => {
    await seed('addresses/public', addressData({ createdAt: new Date() }));
    await seed('addresses/private', addressData({ isPublic: false, createdAt: new Date() }));
  });

  it('le propriétaire lit ses adresses publiques et privées', async () => {
    const db = asUser(alice);
    await assertSucceeds(getDoc(doc(db, 'addresses', 'public')));
    await assertSucceeds(getDoc(doc(db, 'addresses', 'private')));
    await assertSucceeds(getDocs(query(collection(db, 'addresses'), where('ownerId', '==', alice.uid))));
  });

  it('les autres utilisateurs ne lisent que les adresses publiques', async () => {
    const db = asUser(bob);
    await assertSucceeds(getDoc(doc(db, 'addresses', 'public')));
    await assertFails(getDoc(doc(db, 'addresses', 'private')));
    await assertSucceeds(getDocs(query(collection(db, 'addresses'), where('isPublic', '==', true))));
    // Une requête pouvant renvoyer des adresses privées est refusée
    await assertFails(getDocs(query(collection(db, 'addresses'), where('ownerId', '==', alice.uid))));
  });

  it('les visiteurs non connectés ne lisent rien', async () => {
    await assertFails(getDoc(doc(asGuest(), 'addresses', 'public')));
  });
});

describe('addresses : modification et suppression', () => {
  beforeEach(async () => {
    await seed('addresses/a1', addressData({ createdAt: new Date() }));
  });

  it('seul le propriétaire peut supprimer son adresse', async () => {
    await assertFails(deleteDoc(doc(asUser(bob), 'addresses', 'a1')));
    await assertSucceeds(deleteDoc(doc(asUser(alice), 'addresses', 'a1')));
  });

  it('seul le propriétaire peut modifier son adresse, sans en changer le propriétaire', async () => {
    await assertFails(updateDoc(doc(asUser(bob), 'addresses', 'a1'), { name: 'Piraté' }));
    await assertSucceeds(updateDoc(doc(asUser(alice), 'addresses', 'a1'), { isPublic: false }));
    await assertFails(updateDoc(doc(asUser(alice), 'addresses', 'a1'), { ownerId: bob.uid }));
  });
});

describe('reviews', () => {
  beforeEach(async () => {
    await seed('addresses/public', addressData({ createdAt: new Date() }));
    await seed('addresses/private', addressData({ isPublic: false, createdAt: new Date() }));
  });

  it('permet de laisser un avis (note, commentaire, photo) sur une adresse publique', async () => {
    const db = asUser(bob);
    await assertSucceeds(setDoc(doc(db, 'addresses/public/reviews/r1'), reviewData()));
    await assertSucceeds(
      setDoc(doc(db, 'addresses/public/reviews/r2'), reviewData({ photoURL: 'https://x/y.jpg' })),
    );
  });

  it('interdit les avis sur une adresse privée', async () => {
    await assertFails(setDoc(doc(asUser(bob), 'addresses/private/reviews/r1'), reviewData()));
  });

  it("interdit de publier un avis au nom d'un autre", async () => {
    await assertFails(
      setDoc(doc(asUser(alice), 'addresses/public/reviews/r1'), reviewData({ authorId: bob.uid })),
    );
  });

  it('refuse une note ou un commentaire invalide', async () => {
    const db = asUser(bob);
    await assertFails(setDoc(doc(db, 'addresses/public/reviews/r1'), reviewData({ rating: 0 })));
    await assertFails(setDoc(doc(db, 'addresses/public/reviews/r2'), reviewData({ rating: 6 })));
    await assertFails(setDoc(doc(db, 'addresses/public/reviews/r3'), reviewData({ rating: 3.5 })));
    await assertFails(setDoc(doc(db, 'addresses/public/reviews/r4'), reviewData({ comment: '' })));
  });

  it("les avis d'une adresse publique sont lisibles par les utilisateurs connectés", async () => {
    await seed('addresses/public/reviews/r1', reviewData({ createdAt: new Date() }));
    await assertSucceeds(getDocs(collection(asUser(alice), 'addresses/public/reviews')));
    await assertSucceeds(getDocs(collection(asUser(bob), 'addresses/public/reviews')));
    await assertFails(getDocs(collection(asGuest(), 'addresses/public/reviews')));
  });

  it("les avis ne sont pas modifiables", async () => {
    await seed('addresses/public/reviews/r1', reviewData({ createdAt: new Date() }));
    await assertFails(updateDoc(doc(asUser(bob), 'addresses/public/reviews/r1'), { rating: 1 }));
  });

  it("l'auteur ou le propriétaire de l'adresse peut supprimer un avis", async () => {
    const charlie = { uid: 'charlie', email: 'charlie@example.com' };
    await seed('addresses/public/reviews/r1', reviewData({ createdAt: new Date() }));
    await seed('addresses/public/reviews/r2', reviewData({ createdAt: new Date() }));
    await assertFails(deleteDoc(doc(asUser(charlie), 'addresses/public/reviews/r1')));
    await assertSucceeds(deleteDoc(doc(asUser(bob), 'addresses/public/reviews/r1')));
    await assertSucceeds(deleteDoc(doc(asUser(alice), 'addresses/public/reviews/r2')));
  });

  it("le propriétaire peut supprimer l'adresse et ses avis en une seule opération", async () => {
    await seed('addresses/public/reviews/r1', reviewData({ createdAt: new Date() }));
    const db = asUser(alice);
    const batch = writeBatch(db);
    batch.delete(doc(db, 'addresses/public/reviews/r1'));
    batch.delete(doc(db, 'addresses/public'));
    await assertSucceeds(batch.commit());
  });
});
