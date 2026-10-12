import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import type { AppUser, NewReviewInput, Review } from '@/types/models';
import { sortByNewest } from '@/utils/format';

import { ADDRESSES, getDisplayName, REVIEWS } from './addressService';
import { toReview } from './firestoreMappers';
import { storagePaths } from './storagePaths';
import { uploadImage } from './storageService';

export async function addReview(
  addressId: string,
  author: AppUser,
  input: NewReviewInput,
): Promise<string> {
  const reviewRef = doc(collection(db, ADDRESSES, addressId, REVIEWS));
  const photoURL = input.photoUri
    ? await uploadImage(input.photoUri, storagePaths.reviewPhoto(addressId, author.uid, reviewRef.id))
    : null;

  await setDoc(reviewRef, {
    authorId: author.uid,
    authorName: getDisplayName(author),
    authorPhotoURL: author.photoURL ?? null,
    rating: input.rating,
    comment: input.comment.trim(),
    photoURL,
    createdAt: serverTimestamp(),
  });
  return reviewRef.id;
}

export function subscribeToReviews(
  addressId: string,
  onData: (reviews: Review[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, ADDRESSES, addressId, REVIEWS),
    (snapshot) =>
      onData(sortByNewest(snapshot.docs.map((review) => toReview(review, addressId)))),
    onError,
  );
}
