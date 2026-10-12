import { DEFAULT_ERROR_MESSAGE, getAuthErrorMessage } from '../authErrors';

describe('getAuthErrorMessage', () => {
  it.each([
    ['auth/email-already-in-use', 'Cette adresse e-mail est déjà utilisée.'],
    ['auth/invalid-credential', 'E-mail ou mot de passe incorrect.'],
    ['auth/wrong-password', 'E-mail ou mot de passe incorrect.'],
    ['auth/weak-password', 'Le mot de passe doit contenir au moins 6 caractères.'],
    ['auth/network-request-failed', 'Problème de connexion réseau.'],
  ])('traduit %s', (code, message) => {
    expect(getAuthErrorMessage({ code })).toBe(message);
  });

  it('renvoie un message générique pour une erreur inconnue', () => {
    expect(getAuthErrorMessage({ code: 'auth/inconnu' })).toBe(DEFAULT_ERROR_MESSAGE);
    expect(getAuthErrorMessage(new Error('boom'))).toBe(DEFAULT_ERROR_MESSAGE);
    expect(getAuthErrorMessage(null)).toBe(DEFAULT_ERROR_MESSAGE);
  });
});
