import * as firestore from 'firebase/firestore';

import { otherUser } from '@/testing/fixtures';

import { addReview, subscribeToReviews } from '../reviewService';
import { uploadImage } from '../storageService';

import { fakeDoc, fakeTimestamp } from '@/testing/firestoreMock';

jest.mock('../storageService', () => ({
  uploadImage: jest.fn(async () => 'https://cdn.example.com/review.jpg'),
}));

const mockedFirestore = firestore as jest.Mocked<typeof firestore>;

describe('addReview', () => {
  it('publie un avis avec note et commentaire', async () => {
    const id = await addReview('a1', otherUser, { rating: 4, comment: ' Très bon ', photoUri: null });

    expect(id).toBe('generated-id');
    expect(uploadImage).not.toHaveBeenCalled();
    expect(mockedFirestore.setDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'addresses/a1/reviews/generated-id' }),
      {
        authorId: 'user-2',
        authorName: 'Bob Durand',
        authorPhotoURL: null,
        rating: 4,
        comment: 'Très bon',
        photoURL: null,
        createdAt: 'SERVER_TIMESTAMP',
      },
    );
  });

  it("joint la photo de l'avis", async () => {
    await addReview('a1', otherUser, { rating: 5, comment: 'Top', photoUri: 'file:///r.jpg' });

    expect(uploadImage).toHaveBeenCalledWith('file:///r.jpg', 'reviews/a1/user-2/generated-id.jpg');
    expect(mockedFirestore.setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ photoURL: 'https://cdn.example.com/review.jpg' }),
    );
  });
});

describe('subscribeToReviews', () => {
  it("récupère les avis de l'adresse, du plus récent au plus ancien", () => {
    const onData = jest.fn();
    mockedFirestore.onSnapshot.mockImplementationOnce(((_ref: unknown, next: (s: unknown) => void) => {
      next({
        docs: [
          fakeDoc('r1', { authorId: 'u', rating: 3, comment: 'a', createdAt: fakeTimestamp('2026-01-01') }),
          fakeDoc('r2', { authorId: 'u', rating: 5, comment: 'b', createdAt: fakeTimestamp('2026-02-01') }),
        ],
      });
      return jest.fn();
    }) as never);

    subscribeToReviews('a1', onData);

    expect(mockedFirestore.collection).toHaveBeenCalledWith(expect.anything(), 'addresses', 'a1', 'reviews');
    expect(onData.mock.calls[0][0].map((r: { id: string }) => r.id)).toEqual(['r2', 'r1']);
  });
});
