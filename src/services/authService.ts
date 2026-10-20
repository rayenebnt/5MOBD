import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Unsubscribe,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { auth, db } from '@/config/firebase';
import type { AppUser } from '@/types/models';

import { displayPhotoURL } from './photoUrl';
import { storagePaths } from './storagePaths';
import { deleteImage, uploadImage } from './storageService';

export const USERS = 'users';

export function toAppUser(user: User): AppUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: displayPhotoURL(user.photoURL || null),
  };
}

function requireCurrentUser(): User {
  const user = auth.currentUser;
  if (!user) throw new Error('Aucun utilisateur connecté.');
  return user;
}

export function subscribeToAuthChanges(callback: (user: AppUser | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, (user) => callback(user ? toAppUser(user) : null));
}

export interface RegisterInput {
  displayName: string;
  email: string;
  password: string;
}

export async function registerUser({ displayName, email, password }: RegisterInput): Promise<AppUser> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const name = displayName.trim();
  await updateProfile(credential.user, { displayName: name });
  await setDoc(doc(db, USERS, credential.user.uid), {
    displayName: name,
    email: credential.user.email,
    photoURL: null,
    createdAt: serverTimestamp(),
  });
  return toAppUser(credential.user);
}

export async function loginUser(email: string, password: string): Promise<AppUser> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return toAppUser(credential.user);
}

export function logoutUser(): Promise<void> {
  return signOut(auth);
}

async function savePhotoURL(user: User, photoURL: string | null): Promise<void> {
  // L'API Auth n'accepte pas `null` : une chaîne vide retire la photo du profil
  await updateProfile(user, { photoURL: photoURL ?? '' });
  await setDoc(doc(db, USERS, user.uid), { photoURL }, { merge: true });
}

export async function updateProfilePhoto(localUri: string): Promise<AppUser> {
  const user = requireCurrentUser();
  const photoURL = await uploadImage(localUri, storagePaths.avatar(user.uid));
  await savePhotoURL(user, photoURL);
  return toAppUser(user);
}

export async function removeProfilePhoto(): Promise<AppUser> {
  const user = requireCurrentUser();
  await deleteImage(storagePaths.avatar(user.uid));
  await savePhotoURL(user, null);
  return toAppUser(user);
}
