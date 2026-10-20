import { fakeDoc } from '@/testing/firestoreMock';

import { toAddress, toReview } from '../firestoreMappers';
import { displayPhotoURL } from '../photoUrl';

// Application branchée sur les émulateurs d'un ordinateur dont l'adresse a changé
jest.mock('@/config/firebase', () => ({ emulatorHost: '172.20.10.2' }));

const OLD = 'http://192.168.1.20:9199/v0/b/demo/o/photo.jpg?alt=media&token=t';
const NEW = 'http://172.20.10.2:9199/v0/b/demo/o/photo.jpg?alt=media&token=t';

describe('photos et changement d’adresse de l’ordinateur', () => {
  it('displayPhotoURL pointe vers l’adresse actuelle des émulateurs', () => {
    expect(displayPhotoURL(OLD)).toBe(NEW);
    expect(displayPhotoURL(undefined)).toBeNull();
  });

  it("les adresses et les avis lus dans Firestore utilisent l'adresse actuelle", () => {
    expect(toAddress(fakeDoc('a1', { ownerId: 'u', latitude: 1, longitude: 2, photoURL: OLD }) as never).photoURL).toBe(NEW);
    const review = toReview(
      fakeDoc('r1', { authorId: 'u', rating: 4, comment: 'ok', photoURL: OLD, authorPhotoURL: OLD }) as never,
      'a1',
    );
    expect(review.photoURL).toBe(NEW);
    expect(review.authorPhotoURL).toBe(NEW);
  });
});
