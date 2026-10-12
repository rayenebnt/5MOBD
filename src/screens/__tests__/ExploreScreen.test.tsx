import { fireEvent, screen } from '@testing-library/react-native';

import * as addressService from '@/services/addressService';
import { mockRouter } from '@/testing/expoRouterMock';
import { makeAddress } from '@/testing/fixtures';
import { renderWithAuth } from '@/testing/render';

import ExploreScreen from '../ExploreScreen';

jest.mock('expo-router', () => require('@/testing/expoRouterMock'));
jest.mock('@/services/addressService', () => ({
  subscribeToOthersPublicAddresses: jest.fn(),
}));

const mockedService = addressService as jest.Mocked<typeof addressService>;

describe('Écran "Explorer"', () => {
  it('affiche les adresses publiques des autres utilisateurs avec leur auteur', () => {
    mockedService.subscribeToOthersPublicAddresses.mockImplementation((_uid, onData) => {
      onData([makeAddress({ id: 'b1', ownerId: 'user-2', ownerName: 'Bob Durand', name: 'Café de Bob' })]);
      return jest.fn();
    });
    renderWithAuth(<ExploreScreen />);

    expect(mockedService.subscribeToOthersPublicAddresses).toHaveBeenCalledWith(
      'user-1',
      expect.any(Function),
      expect.any(Function),
    );
    expect(screen.getByText('Café de Bob')).toBeOnTheScreen();
    expect(screen.getByText('par Bob Durand')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('address-card-b1'));
    expect(mockRouter.push).toHaveBeenCalledWith('/address/b1');
  });

  it("indique qu'aucune adresse n'est partagée", () => {
    mockedService.subscribeToOthersPublicAddresses.mockImplementation((_uid, onData) => {
      onData([]);
      return jest.fn();
    });
    renderWithAuth(<ExploreScreen />);
    expect(screen.getByTestId('explore-empty')).toBeOnTheScreen();
  });

  it('signale une erreur de chargement', () => {
    mockedService.subscribeToOthersPublicAddresses.mockImplementation((_uid, _onData, onError) => {
      onError?.(new Error('unavailable'));
      return jest.fn();
    });
    renderWithAuth(<ExploreScreen />);
    expect(screen.getByTestId('explore-error')).toBeOnTheScreen();
  });
});
