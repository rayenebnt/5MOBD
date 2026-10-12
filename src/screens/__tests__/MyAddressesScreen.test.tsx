import { fireEvent, screen } from '@testing-library/react-native';

import * as addressService from '@/services/addressService';
import { mockRouter } from '@/testing/expoRouterMock';
import { makeAddress } from '@/testing/fixtures';
import { renderWithAuth } from '@/testing/render';

import MyAddressesScreen from '../MyAddressesScreen';

jest.mock('expo-router', () => require('@/testing/expoRouterMock'));
jest.mock('@/services/addressService', () => ({
  subscribeToMyAddresses: jest.fn(),
}));

const mockedService = addressService as jest.Mocked<typeof addressService>;

function withAddresses(addresses: ReturnType<typeof makeAddress>[]) {
  mockedService.subscribeToMyAddresses.mockImplementation((_uid, onData) => {
    onData(addresses);
    return jest.fn();
  });
}

describe('Écran "Mes adresses"', () => {
  const publicAddress = makeAddress({ id: 'p1', name: 'Bistrot', isPublic: true });
  const privateAddress = makeAddress({ id: 'p2', name: 'Chez mes parents', isPublic: false });

  it('affiche mes adresses publiques et privées', () => {
    withAddresses([publicAddress, privateAddress]);
    renderWithAuth(<MyAddressesScreen />);

    expect(screen.getByText('Bistrot')).toBeOnTheScreen();
    expect(screen.getByText('Chez mes parents')).toBeOnTheScreen();
    expect(screen.getByText('Publique')).toBeOnTheScreen();
    expect(screen.getByText('Privée')).toBeOnTheScreen();
  });

  it('filtre les adresses publiques ou privées', () => {
    withAddresses([publicAddress, privateAddress]);
    renderWithAuth(<MyAddressesScreen />);

    fireEvent.press(screen.getByTestId('filter-public'));
    expect(screen.getByText('Bistrot')).toBeOnTheScreen();
    expect(screen.queryByText('Chez mes parents')).toBeNull();

    fireEvent.press(screen.getByTestId('filter-private'));
    expect(screen.queryByText('Bistrot')).toBeNull();
    expect(screen.getByText('Chez mes parents')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('filter-all'));
    expect(screen.getByText('Bistrot')).toBeOnTheScreen();
  });

  it("ouvre le détail d'une adresse", () => {
    withAddresses([publicAddress]);
    renderWithAuth(<MyAddressesScreen />);

    fireEvent.press(screen.getByTestId('address-card-p1'));
    expect(mockRouter.push).toHaveBeenCalledWith('/address/p1');
  });

  it("invite à ajouter une adresse quand la liste est vide", () => {
    withAddresses([]);
    renderWithAuth(<MyAddressesScreen />);

    expect(screen.getByTestId('my-addresses-empty')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('my-addresses-add'));
    expect(mockRouter.push).toHaveBeenCalledWith('/address/new');
  });

  it('affiche un indicateur pendant le chargement', () => {
    mockedService.subscribeToMyAddresses.mockImplementation(() => jest.fn());
    renderWithAuth(<MyAddressesScreen />);
    expect(screen.getByTestId('loading-view')).toBeOnTheScreen();
  });
});
