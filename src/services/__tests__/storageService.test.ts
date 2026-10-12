import * as storage from 'firebase/storage';

import { storagePaths } from '../storagePaths';
import { deleteImage, uploadImage } from '../storageService';

jest.mock('firebase/storage', () => ({
  ref: jest.fn((_storage: unknown, path: string) => ({ fullPath: path })),
  uploadBytes: jest.fn(async () => undefined),
  getDownloadURL: jest.fn(async () => 'https://cdn.example.com/file.jpg'),
  deleteObject: jest.fn(async () => undefined),
}));

const mockedStorage = storage as jest.Mocked<typeof storage>;

describe('storagePaths', () => {
  it('range les fichiers par utilisateur', () => {
    expect(storagePaths.avatar('u1')).toBe('users/u1/avatar.jpg');
    expect(storagePaths.addressPhoto('u1', 'a1')).toBe('addresses/u1/a1.jpg');
    expect(storagePaths.reviewPhoto('a1', 'u2', 'r1')).toBe('reviews/a1/u2/r1.jpg');
  });
});

describe('uploadImage', () => {
  it("envoie le fichier local et renvoie l'URL de téléchargement", async () => {
    const blob = { type: 'image/png' };
    global.fetch = jest.fn(async () => ({ blob: async () => blob })) as never;

    const url = await uploadImage('file:///photo.png', 'users/u1/avatar.jpg');

    expect(global.fetch).toHaveBeenCalledWith('file:///photo.png');
    expect(mockedStorage.uploadBytes).toHaveBeenCalledWith(
      { fullPath: 'users/u1/avatar.jpg' },
      blob,
      { contentType: 'image/png' },
    );
    expect(url).toBe('https://cdn.example.com/file.jpg');
  });
});

describe('deleteImage', () => {
  it('supprime le fichier', async () => {
    await deleteImage('users/u1/avatar.jpg');
    expect(mockedStorage.deleteObject).toHaveBeenCalledWith({ fullPath: 'users/u1/avatar.jpg' });
  });

  it("ignore un fichier inexistant mais remonte les autres erreurs", async () => {
    mockedStorage.deleteObject.mockRejectedValueOnce({ code: 'storage/object-not-found' });
    await expect(deleteImage('x.jpg')).resolves.toBeUndefined();

    mockedStorage.deleteObject.mockRejectedValueOnce({ code: 'storage/unauthorized' });
    await expect(deleteImage('x.jpg')).rejects.toEqual({ code: 'storage/unauthorized' });
  });
});
