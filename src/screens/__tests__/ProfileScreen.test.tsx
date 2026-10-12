import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';

import { currentUser } from '@/testing/fixtures';
import { renderWithAuth } from '@/testing/render';

import ProfileScreen from '../ProfileScreen';

const mockedPicker = ImagePicker as jest.Mocked<typeof ImagePicker>;

describe('Écran profil', () => {
  it("affiche les informations de l'utilisateur", () => {
    renderWithAuth(<ProfileScreen />);

    expect(screen.getByTestId('profile-name')).toHaveTextContent('Alice Martin');
    expect(screen.getByTestId('profile-email')).toHaveTextContent('alice@example.com');
    expect(screen.getByTestId('profile-avatar-initials')).toBeOnTheScreen();
    expect(screen.queryByTestId('profile-photo-remove')).toBeNull();
  });

  it('ajoute une photo de profil depuis la galerie', async () => {
    const { auth } = renderWithAuth(<ProfileScreen />);

    fireEvent.press(screen.getByTestId('profile-photo-library'));

    await waitFor(() => expect(auth.updatePhoto).toHaveBeenCalledWith('file:///library.jpg'));
    expect(mockedPicker.launchImageLibraryAsync).toHaveBeenCalledWith(expect.objectContaining({ aspect: [1, 1] }));
  });

  it("prend une photo de profil avec l'appareil photo", async () => {
    const { auth } = renderWithAuth(<ProfileScreen />);

    fireEvent.press(screen.getByTestId('profile-photo-camera'));
    await waitFor(() => expect(auth.updatePhoto).toHaveBeenCalledWith('file:///camera.jpg'));
  });

  it('affiche et supprime la photo de profil existante', async () => {
    const user = { ...currentUser, photoURL: 'https://cdn.example.com/avatar.jpg' };
    const { auth } = renderWithAuth(<ProfileScreen />, { user });

    expect(screen.getByTestId('profile-avatar-image')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('profile-photo-remove'));
    await waitFor(() => expect(auth.removePhoto).toHaveBeenCalled());
  });

  it("déconnecte l'utilisateur", async () => {
    const { auth } = renderWithAuth(<ProfileScreen />);

    fireEvent.press(screen.getByTestId('logout-button'));
    await waitFor(() => expect(auth.signOut).toHaveBeenCalled());
  });
});
