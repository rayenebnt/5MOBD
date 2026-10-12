import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
  where,
  writeBatch,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import type { Address, AppUser, NewAddressInput } from '@/types/models';
import { sortByNewest } from '@/utils/format';

import { toAddress } from './firestoreMappers';
import { storagePaths } from './storagePaths';
import { deleteImage, uploadImage } from './storageService';

export const ADDRESSES = 'addresses';
export const REVIEWS = 'reviews';

type ErrorHandler = (error: Error) => void;

export function getDisplayName(user: AppUser): string {
  return user.displayName || user.email || 'Utilisateur';
}

export async function createAddress(owner: AppUser, input: NewAddressInput): Promise<string> {
  const addressRef = doc(collection(db, ADDRESSES));
  const photoURL = input.photoUri
    ? await uploadImage(input.photoUri, storagePaths.addressPhoto(owner.uid, addressRef.id))
    : null;

  await setDoc(addressRef, {
    ownerId: owner.uid,
    ownerName: getDisplayName(owner),
    name: input.name.trim(),
    description: input.description.trim(),
    isPublic: input.isPublic,
    latitude: input.latitude,
    longitude: input.longitude,
    photoURL,
    createdAt: serverTimestamp(),
  });
  return addressRef.id;
}

/** Supprime l'adresse, ses avis et sa photo. Réservé au propriétaire (cf. règles Firestore). */
export async function deleteAddress(address: Address): Promise<void> {
  const addressRef = doc(db, ADDRESSES, address.id);
  const reviews = await getDocs(collection(addressRef, REVIEWS));

  const batch = writeBatch(db);
  reviews.forEach((review) => batch.delete(review.ref));
  batch.delete(addressRef);
  await batch.commit();

  if (address.photoURL) {
    await deleteImage(storagePaths.addressPhoto(address.ownerId, address.id)).catch(() => undefined);
  }
}

/** Mes adresses, publiques et privées. */
export function subscribeToMyAddresses(
  uid: string,
  onData: (addresses: Address[]) => void,
  onError?: ErrorHandler,
): Unsubscribe {
  const q = query(collection(db, ADDRESSES), where('ownerId', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => onData(sortByNewest(snapshot.docs.map(toAddress))),
    onError,
  );
}

/** Adresses publiques partagées par les autres utilisateurs. */
export function subscribeToOthersPublicAddresses(
  uid: string,
  onData: (addresses: Address[]) => void,
  onError?: ErrorHandler,
): Unsubscribe {
  const q = query(collection(db, ADDRESSES), where('isPublic', '==', true));
  return onSnapshot(
    q,
    (snapshot) =>
      onData(
        sortByNewest(snapshot.docs.map(toAddress).filter((address) => address.ownerId !== uid)),
      ),
    onError,
  );
}

export function subscribeToAddress(
  addressId: string,
  onData: (address: Address | null) => void,
  onError?: ErrorHandler,
): Unsubscribe {
  return onSnapshot(
    doc(db, ADDRESSES, addressId),
    (snapshot) => onData(snapshot.exists() ? toAddress(snapshot) : null),
    onError,
  );
}
