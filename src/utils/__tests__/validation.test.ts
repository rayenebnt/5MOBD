import {
  hasErrors,
  isValidEmail,
  validateAddress,
  validateLogin,
  validateRegister,
  validateReview,
} from '../validation';

describe('isValidEmail', () => {
  it.each(['alice@example.com', ' bob.durand@mail.fr '])('accepte %s', (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  it.each(['', 'alice', 'alice@', 'alice@example', 'a b@c.d'])('refuse "%s"', (email) => {
    expect(isValidEmail(email)).toBe(false);
  });
});

describe('hasErrors', () => {
  it('détecte la présence d’au moins une erreur', () => {
    expect(hasErrors({})).toBe(false);
    expect(hasErrors({ email: undefined })).toBe(false);
    expect(hasErrors({ email: 'Erreur' })).toBe(true);
  });
});

describe('validateLogin', () => {
  it('exige un e-mail valide et un mot de passe', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: "L'e-mail est obligatoire.",
      password: 'Le mot de passe est obligatoire.',
    });
    expect(validateLogin({ email: 'invalide', password: 'x' })).toEqual({
      email: 'Adresse e-mail invalide.',
    });
  });

  it('ne renvoie aucune erreur pour des identifiants valides', () => {
    expect(validateLogin({ email: 'alice@example.com', password: 'secret' })).toEqual({});
  });
});

describe('validateRegister', () => {
  const valid = {
    displayName: 'Alice',
    email: 'alice@example.com',
    password: 'secret1',
    confirmPassword: 'secret1',
  };

  it('accepte un formulaire valide', () => {
    expect(validateRegister(valid)).toEqual({});
  });

  it('exige un nom', () => {
    expect(validateRegister({ ...valid, displayName: '   ' }).displayName).toBe('Le nom est obligatoire.');
    expect(validateRegister({ ...valid, displayName: 'x'.repeat(51) }).displayName).toMatch(/50/);
  });

  it('exige un mot de passe de 6 caractères minimum', () => {
    expect(validateRegister({ ...valid, password: '123', confirmPassword: '123' }).password).toMatch(
      /au moins 6/,
    );
  });

  it('vérifie la confirmation du mot de passe', () => {
    expect(validateRegister({ ...valid, confirmPassword: 'autre' }).confirmPassword).toBe(
      'Les mots de passe ne correspondent pas.',
    );
  });
});

describe('validateAddress', () => {
  const valid = { name: 'Bistrot', description: '', latitude: 48.8, longitude: 2.3 };

  it('accepte une adresse avec un nom et un emplacement', () => {
    expect(validateAddress(valid)).toEqual({});
  });

  it('exige un nom de 80 caractères maximum', () => {
    expect(validateAddress({ ...valid, name: ' ' }).name).toBe('Le nom est obligatoire.');
    expect(validateAddress({ ...valid, name: 'x'.repeat(81) }).name).toMatch(/80/);
  });

  it('limite la description à 500 caractères', () => {
    expect(validateAddress({ ...valid, description: 'x'.repeat(501) }).description).toMatch(/500/);
  });

  it('exige un emplacement', () => {
    expect(validateAddress({ ...valid, latitude: null, longitude: null }).location).toBeDefined();
  });
});

describe('validateReview', () => {
  it('exige une note entière entre 1 et 5', () => {
    expect(validateReview({ rating: 0, comment: 'Bien' }).rating).toBeDefined();
    expect(validateReview({ rating: 6, comment: 'Bien' }).rating).toBeDefined();
    expect(validateReview({ rating: 2.5, comment: 'Bien' }).rating).toBeDefined();
    expect(validateReview({ rating: 5, comment: 'Bien' })).toEqual({});
  });

  it('exige un commentaire de 500 caractères maximum', () => {
    expect(validateReview({ rating: 4, comment: '  ' }).comment).toBe('Le commentaire est obligatoire.');
    expect(validateReview({ rating: 4, comment: 'x'.repeat(501) }).comment).toMatch(/500/);
  });
});
