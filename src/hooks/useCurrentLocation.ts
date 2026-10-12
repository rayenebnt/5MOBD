import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import type { Coordinates } from '@/types/models';

export type LocationStatus = 'loading' | 'granted' | 'denied' | 'error';

export interface CurrentLocation {
  location: Coordinates | null;
  status: LocationStatus;
  refresh: () => Promise<void>;
}

/** Demande la permission puis récupère la position actuelle de l'utilisateur. */
export function useCurrentLocation(): CurrentLocation {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<LocationStatus>('loading');

  const refresh = useCallback(async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setStatus('denied');
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      setStatus('granted');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { location, status, refresh };
}
