import { withEmulatorHost } from '@/config/emulatorHost';
import { emulatorHost } from '@/config/firebase';

/** URL d'une photo prête à afficher (adresse des émulateurs mise à jour si besoin). */
export function displayPhotoURL(url: string | null | undefined): string | null {
  return withEmulatorHost(url ?? null, emulatorHost ?? null);
}
