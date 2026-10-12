import * as ImagePicker from 'expo-image-picker';

export type ImageSource = 'library' | 'camera';

export class PermissionDeniedError extends Error {
  constructor(source: ImageSource) {
    super(
      source === 'camera'
        ? "L'accès à l'appareil photo a été refusé."
        : "L'accès aux photos a été refusé.",
    );
    this.name = 'PermissionDeniedError';
  }
}

/**
 * Ouvre la galerie ou l'appareil photo et retourne l'URI locale de l'image,
 * ou `null` si l'utilisateur annule.
 */
export async function pickImage(
  source: ImageSource,
  aspect: [number, number] = [4, 3],
): Promise<string | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new PermissionDeniedError(source);

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.5,
  };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled || result.assets.length === 0) return null;
  return result.assets[0].uri;
}
