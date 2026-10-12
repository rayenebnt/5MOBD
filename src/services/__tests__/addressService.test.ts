import * as firestore from 'firebase/firestore';

import { currentUser, makeAddress } from '@/testing/fixtures';

import {
  createAddress,
  deleteAddress,
  getDisplayName,
  subscribeToAddress,
  subscribeToMyAddresses,
  subscribeToOthersPublicAddresses,
} from '../addressService';
import { deleteImage, uploadImage } from '../storageService';

import { fakeDoc, fakeTimestamp, mockBatch } from '@/testing/firestoreMock';

jest.mock('../storageService', () => ({
  uploadImage: jest.fn(async () => 'https://cdn.example.com/photo.jpg'),
  deleteImage: jest.fn(async () => undefined),
}));

const mockedFirestore = firestore as jest.Mocked<typeof firestore>;

const input = {
  name: '  Le Petit Bistrot ',
  description: ' Terrasse ',
  isPublic: false,
  latitude: 48.85,
  longitude: 2.35,
  photoUri: null,
};

describe('getDisplayName', () => {
  it('utilise le nom, sinon l’e-mail', () => {
    expect(getDisplayName(currentUser)).toBe('Alice Martin');
    expect(getDisplayName({ ...currentUser, displayName: null })).toBe('alice@example.com');
    expect(getDisplayName({ ...currentUser, displayName: null, email: null })).toBe('Utilisateur');
  });
});

describe('createAddress', () => {
  it('enregistre une adresse privée avec nom et description', async () => {
    const id = await createAddress(currentUser, input);

    expect(id).toBe('generated-id');
    expect(uploadImage).not.toHaveBeenCalled();
    expect(mockedFirestore.setDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'addresses/generated-id' }),
      {
        ownerId: 'user-1',
        ownerName: 'Alice Martin',
        name: 'Le Petit Bistrot',
        description: 'Terrasse',
        isPublic: false,
        latitude: 48.85,
        longitude: 2.35,
        photoURL: null,
        createdAt: 'SERVER_TIMESTAMP',
      },
    );
  });

  it('envoie la photo puis enregistre son URL pour une adresse publique', async () => {
    await createAddress(currentUser, { ...input, isPublic: true, photoUri: 'file:///photo.jpg' });

    expect(uploadImage).toHaveBeenCalledWith('file:///photo.jpg', 'addresses/user-1/generated-id.jpg');
    expect(mockedFirestore.setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ isPublic: true, photoURL: 'https://cdn.example.com/photo.jpg' }),
    );
  });
});

describe('deleteAddress', () => {
  it("supprime l'adresse, ses avis et sa photo", async () => {
    const reviews = [fakeDoc('r1', {}), fakeDoc('r2', {})];
    mockedFirestore.getDocs.mockResolvedValueOnce({
      forEach: (callback: (doc: unknown) => void) => reviews.forEach(callback),
    } as never);

    await deleteAddress(makeAddress({ id: 'a1', ownerId: 'user-1' }));

    expect(mockBatch.delete).toHaveBeenCalledWith(reviews[0].ref);
    expect(mockBatch.delete).toHaveBeenCalledWith(reviews[1].ref);
    expect(mockBatch.delete).toHaveBeenCalledWith(expect.objectContaining({ path: 'addresses/a1' }));
    expect(mockBatch.commit).toHaveBeenCalled();
    expect(deleteImage).toHaveBeenCalledWith('addresses/user-1/a1.jpg');
  });

  it('ne touche pas au stockage si l’adresse n’a pas de photo', async () => {
    mockedFirestore.getDocs.mockResolvedValueOnce({ forEach: () => undefined } as never);
    await deleteAddress(makeAddress({ photoURL: null }));
    expect(deleteImage).not.toHaveBeenCalled();
  });
});

describe('abonnements', () => {
  const addressDoc = (id: string, ownerId: string, isPublic: boolean, date: string) =>
    fakeDoc(id, {
      ownerId,
      ownerName: ownerId,
      name: id,
      isPublic,
      latitude: 1,
      longitude: 2,
      createdAt: fakeTimestamp(date),
    });

  it('récupère mes adresses publiques et privées, triées par date', () => {
    const onData = jest.fn();
    mockedFirestore.onSnapshot.mockImplementationOnce(((_query: unknown, next: (s: unknown) => void) => {
      next({ docs: [addressDoc('old', 'user-1', true, '2026-01-01'), addressDoc('new', 'user-1', false, '2026-05-01')] });
      return jest.fn();
    }) as never);

    subscribeToMyAddresses('user-1', onData);

    expect(mockedFirestore.where).toHaveBeenCalledWith('ownerId', '==', 'user-1');
    expect(onData.mock.calls[0][0].map((a: { id: string }) => a.id)).toEqual(['new', 'old']);
  });

  it('récupère uniquement les adresses publiques des autres utilisateurs', () => {
    const onData = jest.fn();
    mockedFirestore.onSnapshot.mockImplementationOnce(((_query: unknown, next: (s: unknown) => void) => {
      next({ docs: [addressDoc('mine', 'user-1', true, '2026-01-01'), addressDoc('bob', 'user-2', true, '2026-02-01')] });
      return jest.fn();
    }) as never);

    subscribeToOthersPublicAddresses('user-1', onData);

    expect(mockedFirestore.where).toHaveBeenCalledWith('isPublic', '==', true);
    expect(onData.mock.calls[0][0].map((a: { id: string }) => a.id)).toEqual(['bob']);
  });

  it("renvoie null si l'adresse n'existe pas", () => {
    const onData = jest.fn();
    mockedFirestore.onSnapshot.mockImplementationOnce(((_ref: unknown, next: (s: unknown) => void) => {
      next(fakeDoc('a1', undefined));
      return jest.fn();
    }) as never);

    subscribeToAddress('a1', onData);
    expect(onData).toHaveBeenCalledWith(null);
  });

  it('transmet les erreurs (ex. permission refusée)', () => {
    const onError = jest.fn();
    const error = new Error('permission-denied');
    mockedFirestore.onSnapshot.mockImplementationOnce(((_ref: unknown, _next: unknown, fail: (e: Error) => void) => {
      fail(error);
      return jest.fn();
    }) as never);

    subscribeToAddress('a1', jest.fn(), onError);
    expect(onError).toHaveBeenCalledWith(error);
  });
});
