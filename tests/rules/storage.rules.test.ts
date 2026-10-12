/**
 * Tests des règles de sécurité Cloud Storage (émulateur requis) :
 *   npm run test:rules
 */
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteObject, getBytes, ref, uploadBytes } from 'firebase/storage';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const PROJECT_ID = 'demo-mesbonnesadresses';

let testEnv: RulesTestEnvironment;

const IMAGE = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const JPEG = { contentType: 'image/jpeg' };

function storageAs(uid: string | null) {
  const context = uid ? testEnv.authenticatedContext(uid) : testEnv.unauthenticatedContext();
  return context.storage();
}

async function seed(path: string) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await uploadBytes(ref(context.storage(), path), IMAGE, JPEG);
  });
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    storage: { rules: readFileSync(resolve(__dirname, '../../storage.rules'), 'utf8') },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearStorage();
});

describe('photos de profil', () => {
  it("l'utilisateur peut envoyer sa propre photo de profil", async () => {
    await assertSucceeds(uploadBytes(ref(storageAs('alice'), 'users/alice/avatar.jpg'), IMAGE, JPEG));
  });

  it("interdit d'envoyer la photo de profil d'un autre", async () => {
    await assertFails(uploadBytes(ref(storageAs('bob'), 'users/alice/avatar.jpg'), IMAGE, JPEG));
    await assertFails(uploadBytes(ref(storageAs(null), 'users/alice/avatar.jpg'), IMAGE, JPEG));
  });

  it("refuse les fichiers qui ne sont pas des images", async () => {
    await assertFails(
      uploadBytes(ref(storageAs('alice'), 'users/alice/avatar.jpg'), IMAGE, {
        contentType: 'application/pdf',
      }),
    );
  });

  it('refuse les images de plus de 5 Mo', async () => {
    const big = new Uint8Array(5 * 1024 * 1024 + 1);
    await assertFails(uploadBytes(ref(storageAs('alice'), 'users/alice/avatar.jpg'), big, JPEG));
  });

  it('seul le propriétaire peut supprimer sa photo', async () => {
    await seed('users/alice/avatar.jpg');
    await assertFails(deleteObject(ref(storageAs('bob'), 'users/alice/avatar.jpg')));
    await assertSucceeds(deleteObject(ref(storageAs('alice'), 'users/alice/avatar.jpg')));
  });

  it('les photos sont lisibles uniquement par les utilisateurs connectés', async () => {
    await seed('users/alice/avatar.jpg');
    await assertSucceeds(getBytes(ref(storageAs('bob'), 'users/alice/avatar.jpg')));
    await assertFails(getBytes(ref(storageAs(null), 'users/alice/avatar.jpg')));
  });
});

describe("photos d'adresses et d'avis", () => {
  it("le propriétaire envoie la photo de son adresse", async () => {
    await assertSucceeds(uploadBytes(ref(storageAs('alice'), 'addresses/alice/a1.jpg'), IMAGE, JPEG));
    await assertFails(uploadBytes(ref(storageAs('bob'), 'addresses/alice/a1.jpg'), IMAGE, JPEG));
  });

  it("l'auteur d'un avis envoie sa photo dans son dossier", async () => {
    await assertSucceeds(uploadBytes(ref(storageAs('bob'), 'reviews/a1/bob/r1.jpg'), IMAGE, JPEG));
    await assertFails(uploadBytes(ref(storageAs('bob'), 'reviews/a1/alice/r1.jpg'), IMAGE, JPEG));
  });

  it('interdit tout autre emplacement', async () => {
    await assertFails(uploadBytes(ref(storageAs('alice'), 'autre/fichier.jpg'), IMAGE, JPEG));
  });
});
