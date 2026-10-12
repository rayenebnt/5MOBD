/**
 * Test d'intégration : les services de l'application sont exécutés avec le vrai
 * SDK Firebase contre les émulateurs (Auth, Firestore, Storage) et les règles
 * de sécurité du projet.
 *   npm run test:firebase
 */
import { setLogLevel } from 'firebase/firestore';

import { auth } from '@/config/firebase';
import {
  createAddress,
  deleteAddress,
  subscribeToAddress,
  subscribeToMyAddresses,
  subscribeToOthersPublicAddresses,
} from '@/services/addressService';
import {
  loginUser,
  logoutUser,
  registerUser,
  removeProfilePhoto,
  updateProfilePhoto,
} from '@/services/authService';
import { addReview, subscribeToReviews } from '@/services/reviewService';
import type { Address, AppUser, Review } from '@/types/models';

jest.mock('@/config/firebase', () => {
  const { initializeApp } = require('firebase/app');
  const { connectAuthEmulator, getAuth } = require('firebase/auth');
  const { connectFirestoreEmulator, getFirestore } = require('firebase/firestore');
  const { connectStorageEmulator, getStorage } = require('firebase/storage');

  const app = initializeApp({
    apiKey: 'demo-api-key',
    authDomain: 'demo-mesbonnesadresses.firebaseapp.com',
    projectId: 'demo-mesbonnesadresses',
    storageBucket: 'demo-mesbonnesadresses.appspot.com',
  });
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
  return { app, auth, db, storage };
});

// Les URI locales (file://) renvoyées par expo-image-picker sont simulées par une image JPEG
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
const realFetch = global.fetch;
global.fetch = ((input: RequestInfo | URL, init?: RequestInit) =>
  typeof input === 'string' && input.startsWith('file://')
    ? Promise.resolve(new Response(new Blob([JPEG], { type: 'image/jpeg' })))
    : realFetch(input, init)) as typeof fetch;

/** Attend le premier résultat d'un abonnement Firestore. */
function firstValue<T>(
  subscribe: (onData: (value: T) => void, onError: (error: Error) => void) => () => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const unsubscribe = subscribe(
      (value) => {
        unsubscribe();
        resolve(value);
      },
      (error) => {
        unsubscribe();
        reject(error);
      },
    );
  });
}

/**
 * Attend le refus du serveur. Le cache local du SDK peut d'abord renvoyer des
 * données lues par l'utilisateur précédent sur le même appareil : on les ignore.
 */
function serverError(
  subscribe: (onData: () => void, onError: (error: Error) => void) => () => void,
): Promise<Error> {
  return new Promise((resolve) => {
    const unsubscribe = subscribe(
      () => undefined,
      (error) => {
        unsubscribe();
        resolve(error);
      },
    );
  });
}

const suffix = Date.now();
const password = 'motdepasse';
const aliceEmail = `alice.${suffix}@e2e.test`;
const bobEmail = `bob.${suffix}@e2e.test`;

let alice: AppUser;
let bob: AppUser;
let publicAddressId: string;
let privateAddressId: string;

beforeAll(() => {
  setLogLevel('error');
});

afterAll(async () => {
  await logoutUser().catch(() => undefined);
});

describe("Parcours complet de l'application (émulateurs Firebase)", () => {
  it("inscrit Alice et crée son profil", async () => {
    alice = await registerUser({ displayName: 'Alice', email: aliceEmail, password });
    expect(alice).toMatchObject({ displayName: 'Alice', email: aliceEmail, photoURL: null });
  });

  it('ajoute puis supprime une photo de profil', async () => {
    const withPhoto = await updateProfilePhoto('file:///avatar.jpg');
    expect(withPhoto.photoURL).toContain(`users%2F${alice.uid}%2Favatar.jpg`);

    const withoutPhoto = await removeProfilePhoto();
    expect(withoutPhoto.photoURL).toBeNull();
  });

  it('crée une adresse privée et une adresse publique avec photo', async () => {
    privateAddressId = await createAddress(alice, {
      name: 'Chez moi',
      description: 'Adresse privée',
      isPublic: false,
      latitude: 48.85,
      longitude: 2.35,
      photoUri: null,
    });
    publicAddressId = await createAddress(alice, {
      name: 'Le Petit Bistrot',
      description: 'Cuisine maison',
      isPublic: true,
      latitude: 48.86,
      longitude: 2.34,
      photoUri: 'file:///bistrot.jpg',
    });

    const mine = await firstValue<Address[]>((next, fail) => subscribeToMyAddresses(alice.uid, next, fail));
    expect(mine.map((address) => address.name).sort()).toEqual(['Chez moi', 'Le Petit Bistrot']);
    const bistrot = mine.find((address) => address.id === publicAddressId);
    expect(bistrot).toMatchObject({ isPublic: true, ownerName: 'Alice' });
    expect(bistrot?.photoURL).toContain('addresses%2F');
  });

  it("Bob ne voit que les adresses publiques des autres utilisateurs", async () => {
    await logoutUser();
    bob = await registerUser({ displayName: 'Bob', email: bobEmail, password });

    const others = await firstValue<Address[]>((next, fail) =>
      subscribeToOthersPublicAddresses(bob.uid, next, fail),
    );
    const ids = others.map((address) => address.id);
    expect(ids).toContain(publicAddressId);
    expect(ids).not.toContain(privateAddressId);

    await expect(
      serverError((next, fail) => subscribeToAddress(privateAddressId, next, fail)),
    ).resolves.toMatchObject({ code: 'permission-denied' });
  });

  it("Bob laisse un avis avec photo sur l'adresse publique d'Alice", async () => {
    await addReview(publicAddressId, bob, { rating: 4, comment: 'Très bon accueil', photoUri: 'file:///avis.jpg' });

    const reviews = await firstValue<Review[]>((next, fail) => subscribeToReviews(publicAddressId, next, fail));
    expect(reviews).toHaveLength(1);
    expect(reviews[0]).toMatchObject({ authorName: 'Bob', rating: 4, comment: 'Très bon accueil' });
    expect(reviews[0].photoURL).toContain('reviews%2F');
  });

  it("Bob ne peut ni commenter une adresse privée ni supprimer l'adresse d'Alice", async () => {
    await expect(
      addReview(privateAddressId, bob, { rating: 5, comment: 'Intrus', photoUri: null }),
    ).rejects.toMatchObject({ code: 'permission-denied' });

    const bistrot = await firstValue<Address | null>((next, fail) => subscribeToAddress(publicAddressId, next, fail));
    await expect(deleteAddress(bistrot as Address)).rejects.toMatchObject({ code: 'permission-denied' });
  });

  it("Alice supprime son adresse publique et les avis associés", async () => {
    await logoutUser();
    await loginUser(aliceEmail, password);
    expect(auth.currentUser?.uid).toBe(alice.uid);

    const bistrot = await firstValue<Address | null>((next, fail) => subscribeToAddress(publicAddressId, next, fail));
    await deleteAddress(bistrot as Address);

    const mine = await firstValue<Address[]>((next, fail) => subscribeToMyAddresses(alice.uid, next, fail));
    expect(mine.map((address) => address.id)).toEqual([privateAddressId]);
  });

  it('refuse une connexion avec un mauvais mot de passe', async () => {
    await logoutUser();
    await expect(loginUser(aliceEmail, 'mauvais')).rejects.toMatchObject({
      code: expect.stringMatching(/auth\/(invalid-credential|wrong-password)/),
    });
  });
});
