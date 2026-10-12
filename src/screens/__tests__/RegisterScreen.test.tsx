import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { renderWithAuth } from '@/testing/render';

import RegisterScreen from '../RegisterScreen';

jest.mock('expo-router', () => require('@/testing/expoRouterMock'));

function fillForm(values: { name?: string; email?: string; password?: string; confirm?: string } = {}) {
  fireEvent.changeText(screen.getByTestId('register-name-input'), values.name ?? 'Alice Martin');
  fireEvent.changeText(screen.getByTestId('register-email-input'), values.email ?? 'alice@example.com');
  fireEvent.changeText(screen.getByTestId('register-password-input'), values.password ?? 'secret1');
  fireEvent.changeText(screen.getByTestId('register-confirm-input'), values.confirm ?? 'secret1');
}

describe("Écran d'inscription", () => {
  it('vérifie le formulaire', async () => {
    const { auth } = renderWithAuth(<RegisterScreen />, { user: null });

    fillForm({ name: '', email: 'invalide', password: '123', confirm: '456' });
    fireEvent.press(screen.getByTestId('register-submit'));

    expect(await screen.findByTestId('register-name-input-error')).toBeOnTheScreen();
    expect(screen.getByTestId('register-email-input-error')).toHaveTextContent('Adresse e-mail invalide.');
    expect(screen.getByTestId('register-password-input-error')).toBeOnTheScreen();
    expect(screen.getByTestId('register-confirm-input-error')).toHaveTextContent(
      'Les mots de passe ne correspondent pas.',
    );
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it('crée le compte', async () => {
    const { auth } = renderWithAuth(<RegisterScreen />, { user: null });

    fillForm();
    fireEvent.press(screen.getByTestId('register-submit'));

    await waitFor(() =>
      expect(auth.signUp).toHaveBeenCalledWith({
        displayName: 'Alice Martin',
        email: 'alice@example.com',
        password: 'secret1',
      }),
    );
  });

  it("signale un e-mail déjà utilisé", async () => {
    const signUp = jest.fn(async () => {
      throw { code: 'auth/email-already-in-use' };
    });
    renderWithAuth(<RegisterScreen />, { user: null, signUp });

    fillForm();
    fireEvent.press(screen.getByTestId('register-submit'));

    expect(await screen.findByTestId('register-error')).toHaveTextContent(
      'Cette adresse e-mail est déjà utilisée.',
    );
  });
});
