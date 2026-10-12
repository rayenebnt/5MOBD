import * as ImagePicker from 'expo-image-picker';

import { PermissionDeniedError, pickImage } from '../imagePicker';

const mocked = ImagePicker as jest.Mocked<typeof ImagePicker>;

describe('pickImage', () => {
  it("renvoie l'URI de l'image choisie dans la galerie", async () => {
    await expect(pickImage('library')).resolves.toBe('file:///library.jpg');
    expect(mocked.launchImageLibraryAsync).toHaveBeenCalledWith(
      expect.objectContaining({ mediaTypes: ['images'], allowsEditing: true }),
    );
  });

  it("renvoie l'URI de la photo prise avec l'appareil photo", async () => {
    await expect(pickImage('camera', [1, 1])).resolves.toBe('file:///camera.jpg');
    expect(mocked.launchCameraAsync).toHaveBeenCalledWith(expect.objectContaining({ aspect: [1, 1] }));
  });

  it("renvoie null si l'utilisateur annule", async () => {
    mocked.launchImageLibraryAsync.mockResolvedValueOnce({ canceled: true, assets: null });
    await expect(pickImage('library')).resolves.toBeNull();
  });

  it('lève une erreur si la permission est refusée', async () => {
    mocked.requestCameraPermissionsAsync.mockResolvedValueOnce({ granted: false } as never);
    await expect(pickImage('camera')).rejects.toBeInstanceOf(PermissionDeniedError);
    expect(mocked.launchCameraAsync).not.toHaveBeenCalled();
  });
});
