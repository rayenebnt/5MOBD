import { act, render, renderHook, screen, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Text } from 'react-native';

import * as authService from '@/services/authService';
import { currentUser } from '@/testing/fixtures';
import type { AppUser } from '@/types/models';

import { AuthProvider, useAuth, useCurrentUser } from '../AuthContext';

jest.mock('@/services/authService', () => ({
  subscribeToAuthChanges: jest.fn(),
  loginUser: jest.fn(),
  registerUser: jest.fn(),
  logoutUser: jest.fn(async () => undefined),
  updateProfilePhoto: jest.fn(),
  removeProfilePhoto: jest.fn(),
}));

const mocked = authService as jest.Mocked<typeof authService>;

let emitAuthChange: (user: AppUser | null) => void = () => undefined;

beforeEach(() => {
  mocked.subscribeToAuthChanges.mockImplementation((callback) => {
    emitAuthChange = callback;
    return jest.fn();
  });
});

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthProvider', () => {
  it("attend l'état d'authentification Firebase", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.initializing).toBe(true);

    act(() => emitAuthChange(currentUser));
    expect(result.current).toMatchObject({ initializing: false, user: currentUser });
  });

  it('connecte puis déconnecte un utilisateur', async () => {
    mocked.loginUser.mockResolvedValueOnce(currentUser);
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => emitAuthChange(null));

    await act(() => result.current.signIn('alice@example.com', 'secret1'));
    expect(mocked.loginUser).toHaveBeenCalledWith('alice@example.com', 'secret1');
    expect(result.current.user).toEqual(currentUser);

    await act(() => result.current.signOut());
    expect(mocked.logoutUser).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });

  it("inscrit un utilisateur avec son nom", async () => {
    mocked.registerUser.mockResolvedValueOnce(currentUser);
    const { result } = renderHook(() => useAuth(), { wrapper });

    const input = { displayName: 'Alice Martin', email: 'alice@example.com', password: 'secret1' };
    await act(() => result.current.signUp(input));

    expect(mocked.registerUser).toHaveBeenCalledWith(input);
    expect(result.current.user?.displayName).toBe('Alice Martin');
  });

  it('met à jour puis supprime la photo de profil', async () => {
    const withPhoto = { ...currentUser, photoURL: 'https://cdn.example.com/avatar.jpg' };
    mocked.updateProfilePhoto.mockResolvedValueOnce(withPhoto);
    mocked.removeProfilePhoto.mockResolvedValueOnce(currentUser);
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => emitAuthChange(currentUser));

    await act(() => result.current.updatePhoto('file:///me.jpg'));
    expect(mocked.updateProfilePhoto).toHaveBeenCalledWith('file:///me.jpg');
    expect(result.current.user?.photoURL).toBe(withPhoto.photoURL);

    await act(() => result.current.removePhoto());
    expect(result.current.user?.photoURL).toBeNull();
  });

  it('expose l’utilisateur courant aux composants', async () => {
    mocked.subscribeToAuthChanges.mockImplementation((callback) => {
      callback(currentUser);
      return jest.fn();
    });
    function Name() {
      return <Text>{useCurrentUser().displayName}</Text>;
    }
    // Comme dans l'application : les écrans protégés attendent la fin de l'initialisation
    function Gate() {
      return useAuth().initializing ? null : <Name />;
    }
    render(<Gate />, { wrapper });
    await waitFor(() => expect(screen.getByText('Alice Martin')).toBeTruthy());
  });

  it('refuse useAuth en dehors du provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useAuth())).toThrow('useAuth doit être utilisé dans un <AuthProvider>.');
  });
});
