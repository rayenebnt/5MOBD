import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import * as addressService from '@/services/addressService';
import { mockRouter } from '@/testing/expoRouterMock';
import { currentUser } from '@/testing/fixtures';
import { renderWithAuth } from '@/testing/render';

import NewAddressScreen from '../NewAddressScreen';

jest.mock('expo-router', () => require('@/testing/expoRouterMock'));
jest.mock('@/services/addressService', () => ({
  createAddress: jest.fn(async () => 'new-id'),
}));

const mockedService = addressService as jest.Mocked<typeof addressService>;

async function renderScreen() {
  renderWithAuth(<NewAddressScreen />);
  // La position actuelle est utilisée comme emplacement par défaut
  await screen.findByTestId('location-picker-marker');
}

describe("Création d'une adresse", () => {
  it("exige un nom", async () => {
    await renderScreen();

    fireEvent.press(screen.getByTestId('save-address-button'));

    expect(await screen.findByTestId('address-name-input-error')).toHaveTextContent('Le nom est obligatoire.');
    expect(mockedService.createAddress).not.toHaveBeenCalled();
  });

  it('crée une adresse privée par défaut, à la position actuelle', async () => {
    await renderScreen();

    fireEvent.changeText(screen.getByTestId('address-name-input'), 'Chez moi');
    fireEvent.changeText(screen.getByTestId('address-description-input'), 'Mon adresse secrète');
    fireEvent.press(screen.getByTestId('save-address-button'));

    await waitFor(() =>
      expect(mockedService.createAddress).toHaveBeenCalledWith(currentUser, {
        name: 'Chez moi',
        description: 'Mon adresse secrète',
        isPublic: false,
        photoUri: null,
        latitude: 45.764,
        longitude: 4.8357,
      }),
    );
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('crée une adresse publique avec photo à un emplacement choisi sur la carte', async () => {
    await renderScreen();

    fireEvent.changeText(screen.getByTestId('address-name-input'), 'Le Petit Bistrot');
    fireEvent(screen.getByTestId('address-public-switch'), 'valueChange', true);
    expect(screen.getByText('Adresse publique')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('address-photo-library'));
    await screen.findByTestId('address-photo-preview');
    fireEvent(screen.getByTestId('location-picker-map'), 'press', {
      nativeEvent: { coordinate: { latitude: 48.85, longitude: 2.35 } },
    });
    fireEvent.press(screen.getByTestId('save-address-button'));

    await waitFor(() =>
      expect(mockedService.createAddress).toHaveBeenCalledWith(currentUser, {
        name: 'Le Petit Bistrot',
        description: '',
        isPublic: true,
        photoUri: 'file:///library.jpg',
        latitude: 48.85,
        longitude: 2.35,
      }),
    );
  });

  it("affiche une erreur si l'enregistrement échoue", async () => {
    mockedService.createAddress.mockRejectedValueOnce(new Error('réseau'));
    await renderScreen();

    fireEvent.changeText(screen.getByTestId('address-name-input'), 'Chez moi');
    fireEvent.press(screen.getByTestId('save-address-button'));

    expect(await screen.findByTestId('address-submit-error')).toBeOnTheScreen();
    expect(mockRouter.back).not.toHaveBeenCalled();
  });
});
