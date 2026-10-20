import type { DocumentData, DocumentSnapshot } from 'firebase/firestore';

import type { Address, Review } from '@/types/models';

import { displayPhotoURL } from './photoUrl';

export function toDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

function readData(snapshot: DocumentSnapshot<DocumentData>): DocumentData {
  // "estimate" : les dates serveur en attente d'écriture ont une valeur provisoire
  return snapshot.data({ serverTimestamps: 'estimate' }) ?? {};
}

export function toAddress(snapshot: DocumentSnapshot<DocumentData>): Address {
  const data = readData(snapshot);
  return {
    id: snapshot.id,
    ownerId: data.ownerId,
    ownerName: data.ownerName ?? '',
    name: data.name ?? '',
    description: data.description ?? '',
    photoURL: displayPhotoURL(data.photoURL),
    isPublic: data.isPublic === true,
    latitude: data.latitude,
    longitude: data.longitude,
    createdAt: toDate(data.createdAt),
  };
}

export function toReview(snapshot: DocumentSnapshot<DocumentData>, addressId: string): Review {
  const data = readData(snapshot);
  return {
    id: snapshot.id,
    addressId,
    authorId: data.authorId,
    authorName: data.authorName ?? '',
    authorPhotoURL: displayPhotoURL(data.authorPhotoURL),
    rating: data.rating,
    comment: data.comment ?? '',
    photoURL: displayPhotoURL(data.photoURL),
    createdAt: toDate(data.createdAt),
  };
}
