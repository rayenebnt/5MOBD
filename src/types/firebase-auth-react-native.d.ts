// `getReactNativePersistence` est exporté par le build React Native de
// firebase/auth mais absent des typings par défaut.
import type { Persistence, ReactNativeAsyncStorage } from 'firebase/auth';

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
