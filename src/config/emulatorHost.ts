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

/** Port du Storage Emulator (cf. firebase.json). */
export const STORAGE_EMULATOR_PORT = 9199;

/**
 * Les URL de téléchargement du Storage Emulator contiennent l'adresse de
 * l'ordinateur au moment de l'envoi (ex. http://192.168.1.20:9199/v0/b/...).
 * Si cette adresse change (autre Wi-Fi, partage de connexion), on pointe
 * vers l'adresse actuelle pour que les photos déjà enregistrées restent visibles.
 */
export function withEmulatorHost(url: string | null, host: string | null): string | null {
  if (!url || !host) return url;
  return url.replace(
    new RegExp(`^http://[^/]+:${STORAGE_EMULATOR_PORT}/`),
    `http://${host}:${STORAGE_EMULATOR_PORT}/`,
  );
}
