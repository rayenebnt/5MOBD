import * as firebaseAuth from 'firebase/auth';
import * as firestore from 'firebase/firestore';

import { auth } from '@/config/firebase';

import {
  loginUser,
  logoutUser,
  registerUser,
  removeProfilePhoto,
  subscribeToAuthChanges,
  updateProfilePhoto,
} from '../authService';
import { deleteImage, uploadImage } from '../storageService';

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(async () => undefined),
  onAuthStateChanged: jest.fn(),
  updateProfile: jest.fn(async (user: Record<string, unknown>, profile: Record<string, unknown>) => {
    Object.assign(user, profile);
  }),
}));
jest.mock('../storageService', () => ({
  uploadImage: jest.fn(async () => 'https://cdn.example.com/avatar.jpg'),
  deleteImage: jest.fn(async () => undefined),
}));

const mockedAuth = firebaseAuth as jest.Mocked<typeof firebaseAuth>;
const mockedFirestore = firestore as jest.Mocked<typeof firestore>;
const mutableAuth = auth as { currentUser: unknown };

function firebaseUser(overrides: Record<string, unknown> = {}) {
  return { uid: 'u1', email: 'alice@example.com', displayName: null, photoURL: null, ...overrides };
}

afterEach(() => {
  mutableAuth.currentUser = null;
});

describe('registerUser', () => {
  it('crée le compte, enregistre le nom et le profil Firestore', async () => {
    const user = firebaseUser();
    mockedAuth.createUserWithEmailAndPassword.mockResolvedValueOnce({ user } as never);

    const result = await registerUser({ displayName: ' Alice ', email: ' alice@example.com ', password: 'secret1' });

    expect(mockedAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'alice@example.com', 'secret1');
    expect(mockedAuth.updateProfile).toHaveBeenCalledWith(user, { displayName: 'Alice' });
    expect(mockedFirestore.setDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'users/u1' }),
      { displayName: 'Alice', email: 'alice@example.com', photoURL: null, createdAt: 'SERVER_TIMESTAMP' },
    );
    expect(result).toEqual({ uid: 'u1', email: 'alice@example.com', displayName: 'Alice', photoURL: null });
  });

  it("propage l'erreur Firebase (e-mail déjà utilisé)", async () => {
    mockedAuth.createUserWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/email-already-in-use' });
    await expect(
      registerUser({ displayName: 'Alice', email: 'alice@example.com', password: 'secret1' }),
    ).rejects.toEqual({ code: 'auth/email-already-in-use' });
    expect(mockedFirestore.setDoc).not.toHaveBeenCalled();
  });
});

describe('loginUser / logoutUser', () => {
  it("connecte l'utilisateur avec son e-mail et son mot de passe", async () => {
    mockedAuth.signInWithEmailAndPassword.mockResolvedValueOnce({ user: firebaseUser({ displayName: 'Alice' }) } as never);

    const result = await loginUser(' alice@example.com', 'secret1');

    expect(mockedAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'alice@example.com', 'secret1');
    expect(result.displayName).toBe('Alice');
  });

  it("déconnecte l'utilisateur", async () => {
    await logoutUser();
    expect(mockedAuth.signOut).toHaveBeenCalledWith(auth);
  });
});

describe('subscribeToAuthChanges', () => {
  it("notifie l'utilisateur connecté ou null", () => {
    const callback = jest.fn();
    mockedAuth.onAuthStateChanged.mockImplementationOnce(((_auth: unknown, next: (u: unknown) => void) => {
      next(firebaseUser());
      next(null);
      return jest.fn();
    }) as never);

    subscribeToAuthChanges(callback);

    expect(callback).toHaveBeenNthCalledWith(1, expect.objectContaining({ uid: 'u1' }));
    expect(callback).toHaveBeenNthCalledWith(2, null);
  });
});

describe('photo de profil', () => {
  it('envoie la nouvelle photo et met à jour le profil', async () => {
    const user = firebaseUser();
    mutableAuth.currentUser = user;

    const result = await updateProfilePhoto('file:///me.jpg');

    expect(uploadImage).toHaveBeenCalledWith('file:///me.jpg', 'users/u1/avatar.jpg');
    expect(mockedAuth.updateProfile).toHaveBeenCalledWith(user, { photoURL: 'https://cdn.example.com/avatar.jpg' });
    expect(mockedFirestore.setDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'users/u1' }),
      { photoURL: 'https://cdn.example.com/avatar.jpg' },
      { merge: true },
    );
    expect(result.photoURL).toBe('https://cdn.example.com/avatar.jpg');
  });

  it('supprime la photo de profil', async () => {
    mutableAuth.currentUser = firebaseUser({ photoURL: 'https://cdn.example.com/avatar.jpg' });

    const result = await removeProfilePhoto();

    expect(deleteImage).toHaveBeenCalledWith('users/u1/avatar.jpg');
    expect(mockedAuth.updateProfile).toHaveBeenCalledWith(expect.anything(), { photoURL: '' });
    expect(mockedFirestore.setDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'users/u1' }),
      { photoURL: null },
      { merge: true },
    );
    expect(result.photoURL).toBeNull();
  });

  it('exige un utilisateur connecté', async () => {
    await expect(updateProfilePhoto('file:///me.jpg')).rejects.toThrow('Aucun utilisateur connecté.');
  });
});
