import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { useCurrentUser } from '@/context/AuthContext';
import { useMyAddresses, useOthersPublicAddresses } from '@/hooks/useAddresses';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { colors, radius, spacing } from '@/theme';
import {
  DEFAULT_COORDINATES,
  getMarkerKind,
  type MarkerKind,
  regionFromCoordinates,
} from '@/utils/map';

export const MARKER_COLORS: Record<MarkerKind, string> = {
  'mine-public': colors.public,
  'mine-private': colors.private,
  other: colors.other,
};

const LEGEND: { kind: MarkerKind; label: string }[] = [
  { kind: 'mine-public', label: 'Mes adresses publiques' },
  { kind: 'mine-private', label: 'Mes adresses privées' },
  { kind: 'other', label: 'Adresses des autres' },
];

export default function MapScreen() {
  const user = useCurrentUser();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { location, status, refresh } = useCurrentLocation();
  const { addresses: myAddresses } = useMyAddresses(user.uid);
  const { addresses: othersAddresses } = useOthersPublicAddresses(user.uid);

  const addresses = useMemo(
    () => [...myAddresses, ...othersAddresses],
    [myAddresses, othersAddresses],
  );

  // Centre automatiquement la carte sur la position de l'utilisateur
  useEffect(() => {
    if (location) mapRef.current?.animateToRegion(regionFromCoordinates(location), 800);
  }, [location]);

  const recenter = () => {
    if (location) mapRef.current?.animateToRegion(regionFromCoordinates(location), 500);
    else refresh();
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        testID="map-view"
        style={StyleSheet.absoluteFill}
        initialRegion={regionFromCoordinates(location ?? DEFAULT_COORDINATES)}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {addresses.map((address) => (
          <Marker
            key={address.id}
            testID={`marker-${address.id}`}
            coordinate={{ latitude: address.latitude, longitude: address.longitude }}
            title={address.name}
            description={
              address.ownerId === user.uid ? address.description : `par ${address.ownerName}`
            }
            pinColor={MARKER_COLORS[getMarkerKind(address, user.uid)]}
            onCalloutPress={() => router.push(`/address/${address.id}`)}
          />
        ))}
      </MapView>

      <View style={styles.legend} pointerEvents="none">
        {LEGEND.map((item) => (
          <View key={item.kind} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: MARKER_COLORS[item.kind] }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>

      {status === 'loading' ? (
        <Text testID="location-loading" style={styles.banner}>
          Localisation en cours…
        </Text>
      ) : null}
      {status === 'denied' || status === 'error' ? (
        <Text testID="location-denied" style={styles.banner}>
          Position indisponible : autorisez la localisation pour centrer la carte sur vous.
        </Text>
      ) : null}

      <Pressable
        testID="recenter-button"
        accessibilityRole="button"
        accessibilityLabel="Centrer sur ma position"
        style={[styles.fab, styles.recenter]}
        onPress={recenter}
      >
        <Ionicons name="locate" size={24} color={colors.primary} />
      </Pressable>
      <Pressable
        testID="add-address-button"
        accessibilityRole="button"
        accessibilityLabel="Ajouter une adresse"
        style={[styles.fab, styles.add]}
        onPress={() => router.push('/address/new')}
      >
        <Ionicons name="add" size={30} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  legend: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: 12,
    color: colors.text,
  },
  banner: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: 96,
    backgroundColor: 'rgba(31,41,51,0.85)',
    color: colors.white,
    padding: spacing.sm,
    borderRadius: radius.md,
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  recenter: {
    bottom: 88,
    backgroundColor: colors.surface,
  },
  add: {
    bottom: spacing.md,
    backgroundColor: colors.primary,
  },
});
