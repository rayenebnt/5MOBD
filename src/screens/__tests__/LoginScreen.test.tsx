import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { mockRouter } from '@/testing/expoRouterMock';
import { renderWithAuth } from '@/testing/render';

import LoginScreen from '../LoginScreen';

jest.mock('expo-router', () => require('@/testing/expoRouterMock'));

describe('Écran de connexion', () => {
  it('vérifie les champs avant de se connecter', async () => {
    const { auth } = renderWithAuth(<LoginScreen />, { user: null });

    fireEvent.press(screen.getByTestId('login-submit'));

    expect(await screen.findByTestId('login-email-input-error')).toHaveTextContent("L'e-mail est obligatoire.");
    expect(screen.getByTestId('login-password-input-error')).toHaveTextContent('Le mot de passe est obligatoire.');
    expect(auth.signIn).not.toHaveBeenCalled();
  });

  it("connecte l'utilisateur avec son e-mail et son mot de passe", async () => {
    const { auth } = renderWithAuth(<LoginScreen />, { user: null });

    fireEvent.changeText(screen.getByTestId('login-email-input'), 'alice@example.com');
    fireEvent.changeText(screen.getByTestId('login-password-input'), 'secret1');
    fireEvent.press(screen.getByTestId('login-submit'));

    await waitFor(() => expect(auth.signIn).toHaveBeenCalledWith('alice@example.com', 'secret1'));
  });

  it('affiche une erreur si les identifiants sont incorrects', async () => {
    const signIn = jest.fn(async () => {
      throw { code: 'auth/invalid-credential' };
    });
    renderWithAuth(<LoginScreen />, { user: null, signIn });

    fireEvent.changeText(screen.getByTestId('login-email-input'), 'alice@example.com');
    fireEvent.changeText(screen.getByTestId('login-password-input'), 'mauvais');
    fireEvent.press(screen.getByTestId('login-submit'));

    expect(await screen.findByTestId('login-error')).toHaveTextContent('E-mail ou mot de passe incorrect.');
  });

  it("mène à l'inscription", () => {
    renderWithAuth(<LoginScreen />, { user: null });
    fireEvent.press(screen.getByTestId('go-to-register'));
    expect(mockRouter.push).toHaveBeenCalledWith('/register');
  });
});
