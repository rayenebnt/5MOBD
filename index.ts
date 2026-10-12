// Point d'entrée : lance Storybook si EXPO_PUBLIC_STORYBOOK_ENABLED=true,
// sinon l'application (Expo Router).
if (process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true') {
  const { registerRootComponent } = require('expo');
  registerRootComponent(require('./.rnstorybook').default);
} else {
  require('expo-router/entry');
}
