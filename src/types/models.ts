export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Utilisateur connecté (issu de Firebase Auth). */
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Address extends Coordinates {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  description: string;
  photoURL: string | null;
  isPublic: boolean;
  createdAt: Date | null;
}

export interface NewAddressInput extends Coordinates {
  name: string;
  description: string;
  isPublic: boolean;
  /** URI locale de la photo choisie (galerie ou appareil photo). */
  photoUri: string | null;
}

export interface Review {
  id: string;
  addressId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  rating: number;
  comment: string;
  photoURL: string | null;
  createdAt: Date | null;
}

export interface NewReviewInput {
  rating: number;
  comment: string;
  photoUri: string | null;
}
