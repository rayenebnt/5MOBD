import type { ConfigContext, ExpoConfig } from 'expo/config';

// Étend app.json : la clé Google Maps n'est nécessaire que pour les builds
// Android natifs (development build / release). Expo Go n'en a pas besoin.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  },
});
