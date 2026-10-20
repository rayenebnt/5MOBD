/**
 * Adresse de l'ordinateur qui fait tourner les émulateurs Firebase.
 *
 * - `configuredHost` (EXPO_PUBLIC_FIREBASE_EMULATOR_HOST) est prioritaire,
 *   ex. 10.0.2.2 pour l'émulateur Android ;
 * - sinon on reprend l'ordinateur qui sert l'application (serveur Metro,
 *   `hostUri` = "192.168.1.20:8081"), ce qui fonctionne aussi depuis un vrai
 *   téléphone connecté au même Wi-Fi ;
 * - à défaut : localhost.
 */
export function getEmulatorHost(configuredHost?: string, hostUri?: string | null): string {
  if (configuredHost) return configuredHost;
  const host = hostUri?.split(':')[0];
  return host || 'localhost';
}
