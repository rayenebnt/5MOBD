import type { Address, AppUser, Review } from '@/types/models';

export const currentUser: AppUser = {
  uid: 'user-1',
  email: 'alice@example.com',
  displayName: 'Alice Martin',
  photoURL: null,
};

export const otherUser: AppUser = {
  uid: 'user-2',
  email: 'bob@example.com',
  displayName: 'Bob Durand',
  photoURL: null,
};

export function makeAddress(overrides: Partial<Address> = {}): Address {
  return {
    id: 'address-1',
    ownerId: currentUser.uid,
    ownerName: 'Alice Martin',
    name: 'Le Petit Bistrot',
    description: 'Cuisine maison et terrasse ensoleillée.',
    photoURL: 'https://picsum.photos/seed/bistrot/400/300',
    isPublic: true,
    latitude: 48.8584,
    longitude: 2.2945,
    createdAt: new Date('2026-09-01T12:00:00Z'),
    ...overrides,
  };
}

export function makeReview(overrides: Partial<Review> = {}): Review {
  return {
    id: 'review-1',
    addressId: 'address-1',
    authorId: otherUser.uid,
    authorName: 'Bob Durand',
    authorPhotoURL: null,
    rating: 4,
    comment: 'Très bon accueil, je recommande !',
    photoURL: null,
    createdAt: new Date('2026-09-02T12:00:00Z'),
    ...overrides,
  };
}
