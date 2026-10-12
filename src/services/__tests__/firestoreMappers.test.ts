import { toAddress, toDate, toReview } from '../firestoreMappers';

import { fakeDoc, fakeTimestamp } from '@/testing/firestoreMock';

describe('toDate', () => {
  it('convertit un Timestamp Firestore ou une Date', () => {
    const date = new Date('2026-01-01');
    expect(toDate(date)).toBe(date);
    expect(toDate(fakeTimestamp('2026-02-01'))).toEqual(new Date('2026-02-01'));
    expect(toDate(null)).toBeNull();
    expect(toDate('2026')).toBeNull();
  });
});

describe('toAddress', () => {
  it('construit une adresse à partir du document', () => {
    const snapshot = fakeDoc('a1', {
      ownerId: 'u1',
      ownerName: 'Alice',
      name: 'Bistrot',
      description: 'Bon',
      isPublic: true,
      latitude: 1,
      longitude: 2,
      photoURL: 'https://x/y.jpg',
      createdAt: fakeTimestamp('2026-03-01'),
    });
    expect(toAddress(snapshot as never)).toEqual({
      id: 'a1',
      ownerId: 'u1',
      ownerName: 'Alice',
      name: 'Bistrot',
      description: 'Bon',
      isPublic: true,
      latitude: 1,
      longitude: 2,
      photoURL: 'https://x/y.jpg',
      createdAt: new Date('2026-03-01'),
    });
  });

  it('applique des valeurs par défaut sûres', () => {
    const address = toAddress(fakeDoc('a2', { ownerId: 'u1', latitude: 1, longitude: 2 }) as never);
    expect(address).toMatchObject({ name: '', description: '', photoURL: null, isPublic: false, createdAt: null });
  });
});

describe('toReview', () => {
  it("construit un avis rattaché à l'adresse", () => {
    const review = toReview(
      fakeDoc('r1', { authorId: 'u2', authorName: 'Bob', rating: 5, comment: 'Top' }) as never,
      'a1',
    );
    expect(review).toEqual({
      id: 'r1',
      addressId: 'a1',
      authorId: 'u2',
      authorName: 'Bob',
      authorPhotoURL: null,
      rating: 5,
      comment: 'Top',
      photoURL: null,
      createdAt: null,
    });
  });
});
