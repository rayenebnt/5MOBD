import { renderHook, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';

import { useCurrentLocation } from '../useCurrentLocation';

const mockedLocation = Location as jest.Mocked<typeof Location>;

describe('useCurrentLocation', () => {
  it("renvoie la position actuelle quand l'utilisateur l'autorise", async () => {
    const { result } = await renderHook(() => useCurrentLocation());

    await waitFor(() => expect(result.current.status).toBe('granted'));
    expect(result.current.location).toEqual({ latitude: 45.764, longitude: 4.8357 });
    expect(mockedLocation.requestForegroundPermissionsAsync).toHaveBeenCalled();
  });

  it('indique le chargement tant que la position est attendue', async () => {
    mockedLocation.requestForegroundPermissionsAsync.mockReturnValueOnce(new Promise(() => undefined));

    const { result } = await renderHook(() => useCurrentLocation());

    expect(result.current).toMatchObject({ status: 'loading', location: null });
  });

  it('signale le refus de la permission', async () => {
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'denied' } as never);

    const { result } = await renderHook(() => useCurrentLocation());

    await waitFor(() => expect(result.current.status).toBe('denied'));
    expect(result.current.location).toBeNull();
    expect(mockedLocation.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('signale une erreur de localisation', async () => {
    mockedLocation.getCurrentPositionAsync.mockRejectedValueOnce(new Error('GPS indisponible'));

    const { result } = await renderHook(() => useCurrentLocation());

    await waitFor(() => expect(result.current.status).toBe('error'));
  });
});
