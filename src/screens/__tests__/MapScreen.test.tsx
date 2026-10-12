import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import * as Maps from 'react-native-maps';

import * as addressService from '@/services/addressService';
import { mockRouter } from '@/testing/expoRouterMock';
import { makeAddress } from '@/testing/fixtures';
import { renderWithAuth } from '@/testing/render';
import { colors } from '@/theme';
import { DEFAULT_COORDINATES } from '@/utils/map';

import MapScreen from '../MapScreen';

jest.mock('expo-router', () => require('@/testing/expoRouterMock'));
jest.mock('@/services/addressService', () => ({
  subscribeToMyAddresses: jest.fn(),
  subscribeToOthersPublicAddresses: jest.fn(),
}));

const mockedService = addressService as jest.Mocked<typeof addressService>;
const mockedLocation = Location as jest.Mocked<typeof Location>;
const { mockAnimateToRegion } = Maps as unknown as { mockAnimateToRegion: jest.Mock };

const myPublic = makeAddress({ id: 'mine-public', isPublic: true, name: 'Bistrot' });
const myPrivate = makeAddress({ id: 'mine-private', isPublic: false, name: 'Chez moi' });
const othersPublic = makeAddress({ id: 'bob-1', ownerId: 'user-2', ownerName: 'Bob', name: 'Café de Bob' });

beforeEach(() => {
  mockedService.subscribeToMyAddresses.mockImplementation((_uid, onData) => {
    onData([myPublic, myPrivate]);
    return jest.fn();
  });
  mockedService.subscribeToOthersPublicAddresses.mockImplementation((_uid, onData) => {
    onData([othersPublic]);
    return jest.fn();
  });
});

describe('Écran carte', () => {
  it("centre automatiquement la carte sur la position de l'utilisateur", async () => {
    renderWithAuth(<MapScreen />);

    expect(screen.getByTestId('map-view')).toHaveProp('showsUserLocation', true);
    await waitFor(() =>
      expect(mockAnimateToRegion).toHaveBeenCalledWith(
        expect.objectContaining({ latitude: 45.764, longitude: 4.8357 }),
        800,
      ),
    );
    expect(screen.queryByTestId('location-loading')).toBeNull();
  });

  it('affiche mes adresses publiques et privées et les adresses publiques des autres', async () => {
    renderWithAuth(<MapScreen />);
    await waitFor(() => expect(mockAnimateToRegion).toHaveBeenCalled());

    expect(mockedService.subscribeToMyAddresses).toHaveBeenCalledWith('user-1', expect.any(Function), expect.any(Function));
    expect(screen.getByTestId('marker-mine-public')).toHaveProp('pinColor', colors.public);
    expect(screen.getByTestId('marker-mine-private')).toHaveProp('pinColor', colors.private);
    expect(screen.getByTestId('marker-bob-1')).toHaveProp('pinColor', colors.other);
    expect(screen.getByTestId('marker-bob-1')).toHaveProp('description', 'par Bob');
  });

  it("ouvre le détail d'une adresse depuis son repère", async () => {
    renderWithAuth(<MapScreen />);
    await waitFor(() => expect(mockAnimateToRegion).toHaveBeenCalled());

    fireEvent(screen.getByTestId('marker-bob-1'), 'calloutPress');
    expect(mockRouter.push).toHaveBeenCalledWith('/address/bob-1');
  });

  it("mène à la création d'une adresse", async () => {
    renderWithAuth(<MapScreen />);
    await waitFor(() => expect(mockAnimateToRegion).toHaveBeenCalled());

    fireEvent.press(screen.getByTestId('add-address-button'));
    expect(mockRouter.push).toHaveBeenCalledWith('/address/new');
  });

  it('recentre la carte à la demande', async () => {
    renderWithAuth(<MapScreen />);
    await waitFor(() => expect(mockAnimateToRegion).toHaveBeenCalledTimes(1));

    fireEvent.press(screen.getByTestId('recenter-button'));
    expect(mockAnimateToRegion).toHaveBeenCalledTimes(2);
  });

  it('prévient si la localisation est refusée et affiche la position par défaut', async () => {
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'denied' } as never);
    renderWithAuth(<MapScreen />);

    expect(await screen.findByTestId('location-denied')).toBeOnTheScreen();
    expect(screen.getByTestId('map-view')).toHaveProp(
      'initialRegion',
      expect.objectContaining(DEFAULT_COORDINATES),
    );
    expect(mockAnimateToRegion).not.toHaveBeenCalled();
  });
});
