import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  loginUser,
  logoutUser,
  type RegisterInput,
  registerUser,
  removeProfilePhoto,
  subscribeToAuthChanges,
  updateProfilePhoto,
} from '@/services/authService';
import type { AppUser } from '@/types/models';

export interface AuthContextValue {
  user: AppUser | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
  updatePhoto: (localUri: string) => Promise<void>;
  removePhoto: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    return subscribeToAuthChanges((nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setUser(await loginUser(email, password));
  }, []);

  const signUp = useCallback(async (input: RegisterInput) => {
    // Le nom est ajouté après la création du compte : on met à jour l'état ensuite
    setUser(await registerUser(input));
  }, []);

  const signOut = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const updatePhoto = useCallback(async (localUri: string) => {
    setUser(await updateProfilePhoto(localUri));
  }, []);

  const removePhoto = useCallback(async () => {
    setUser(await removeProfilePhoto());
  }, []);

  const value = useMemo(
    () => ({ user, initializing, signIn, signUp, signOut, updatePhoto, removePhoto }),
    [user, initializing, signIn, signUp, signOut, updatePhoto, removePhoto],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans un <AuthProvider>.');
  return context;
}

/** Utilisateur connecté (les écrans protégés ne sont accessibles qu'une fois connecté). */
export function useCurrentUser(): AppUser {
  const { user } = useAuth();
  if (!user) throw new Error('Aucun utilisateur connecté.');
  return user;
}
