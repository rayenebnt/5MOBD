/**
 * Test fonctionnel de la navigation avec le vrai routeur (Expo Router) :
 * les écrans de l'application ne sont accessibles qu'une fois connecté.
 */
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import * as addressService from '@/services/addressService';
import * as authService from '@/services/authService';
import { currentUser } from '@/testing/fixtures';
import type { AppUser } from '@/types/models';

import TabsLayout from '../../app/(tabs)/_layout';
import RootLayout from '../../app/_layout';
import AddressDetailScreen from '../screens/AddressDetailScreen';
import ExploreScreen from '../screens/ExploreScreen';
import LoginScreen from '../screens/LoginScreen';
import MapScreen from '../screens/MapScreen';
import MyAddressesScreen from '../screens/MyAddressesScreen';
import NewAddressScreen from '../screens/NewAddressScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';

jest.mock('@/services/authService', () => ({
  subscribeToAuthChanges: jest.fn(),
  loginUser: jest.fn(),
  registerUser: jest.fn(),
  logoutUser: jest.fn(async () => undefined),
  updateProfilePhoto: jest.fn(),
  removeProfilePhoto: jest.fn(),
}));
jest.mock('@/services/addressService', () => ({
  subscribeToMyAddresses: jest.fn(),
  subscribeToOthersPublicAddresses: jest.fn(),
  subscribeToAddress: jest.fn(),
  createAddress: jest.fn(),
  deleteAddress: jest.fn(),
}));

const mockedAuth = authService as jest.Mocked<typeof authService>;
const mockedAddresses = addressService as jest.Mocked<typeof addressService>;

const routes = {
  _layout: RootLayout,
  login: LoginScreen,
  register: RegisterScreen,
  '(tabs)/_layout': TabsLayout,
  '(tabs)/index': MapScreen,
  '(tabs)/my-addresses': MyAddressesScreen,
  '(tabs)/explore': ExploreScreen,
  '(tabs)/profile': ProfileScreen,
  'address/new': NewAddressScreen,
  'address/[id]': AddressDetailScreen,
};

function startApp(initialUser: AppUser | null) {
  mockedAuth.subscribeToAuthChanges.mockImplementation((callback) => {
    callback(initialUser);
    return jest.fn();
  });
  return renderRouter(routes, { initialUrl: '/' });
}

beforeEach(() => {
  mockedAddresses.subscribeToMyAddresses.mockImplementation((_uid, onData) => {
    onData([]);
    return jest.fn();
  });
  mockedAddresses.subscribeToOthersPublicAddresses.mockImplementation((_uid, onData) => {
    onData([]);
    return jest.fn();
  });
});

describe('Navigation', () => {
  it("affiche l'écran de connexion quand l'utilisateur n'est pas connecté", async () => {
    const app = startApp(null);

    expect(await screen.findByTestId('login-submit')).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/login');
  });

  it("donne accès à l'inscription depuis la connexion", async () => {
    const app = startApp(null);

    fireEvent.press(await screen.findByTestId('go-to-register'));
    expect(await screen.findByTestId('register-submit')).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/register');
  });

  it('affiche la carte une fois connecté', async () => {
    const app = startApp(currentUser);

    expect(await screen.findByTestId('map-view')).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/');
  });

  it('se connecte puis se déconnecte', async () => {
    mockedAuth.loginUser.mockResolvedValueOnce(currentUser);
    const app = startApp(null);

    fireEvent.changeText(await screen.findByTestId('login-email-input'), 'alice@example.com');
    fireEvent.changeText(screen.getByTestId('login-password-input'), 'secret1');
    fireEvent.press(screen.getByTestId('login-submit'));

    expect(await screen.findByTestId('map-view')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('tab-profile'));
    expect(await screen.findByTestId('profile-name')).toHaveTextContent('Alice Martin');

    await act(async () => {
      fireEvent.press(screen.getByTestId('logout-button'));
    });
    await waitFor(() => expect(app.getPathname()).toBe('/login'));
    expect(mockedAuth.logoutUser).toHaveBeenCalled();
  });

  it("ouvre le formulaire de création d'adresse depuis la carte", async () => {
    const app = startApp(currentUser);

    fireEvent.press(await screen.findByTestId('add-address-button'));
    expect(await screen.findByTestId('save-address-button')).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/address/new');
    // L'emplacement par défaut est la position actuelle de l'utilisateur
    expect(await screen.findByTestId('location-picker-marker')).toBeOnTheScreen();
  });
});
