import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { AuthContext, type AuthContextValue } from '@/context/AuthContext';

import { currentUser } from './fixtures';

export function createAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    user: currentUser,
    initializing: false,
    signIn: jest.fn(async () => undefined),
    signUp: jest.fn(async () => undefined),
    signOut: jest.fn(async () => undefined),
    updatePhoto: jest.fn(async () => undefined),
    removePhoto: jest.fn(async () => undefined),
    ...overrides,
  };
}

/** Rend un composant avec un contexte d'authentification simulé. */
export function renderWithAuth(ui: ReactElement, overrides: Partial<AuthContextValue> = {}) {
  const auth = createAuthValue(overrides);
  const utils = render(<AuthContext.Provider value={auth}>{ui}</AuthContext.Provider>);
  return { ...utils, auth };
}
