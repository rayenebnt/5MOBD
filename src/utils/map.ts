import type { Address, Coordinates } from '@/types/models';

export interface Region extends Coordinates {
  latitudeDelta: number;
  longitudeDelta: number;
}

/** Position par défaut (Paris) si la localisation est indisponible. */
export const DEFAULT_COORDINATES: Coordinates = { latitude: 48.8566, longitude: 2.3522 };

export const DEFAULT_DELTA = 0.05;

export function regionFromCoordinates(coords: Coordinates, delta = DEFAULT_DELTA): Region {
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

/** Une adresse est "à moi" si j'en suis le propriétaire, sinon c'est une adresse publique d'un autre. */
export type MarkerKind = 'mine-public' | 'mine-private' | 'other';

export function getMarkerKind(address: Address, currentUid: string): MarkerKind {
  if (address.ownerId !== currentUid) return 'other';
  return address.isPublic ? 'mine-public' : 'mine-private';
}
