import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { colors, radius, spacing } from '@/theme';
import type { Coordinates } from '@/types/models';
import { regionFromCoordinates } from '@/utils/map';

export interface LocationPickerProps {
  value: Coordinates | null;
  onChange: (coordinates: Coordinates) => void;
  /** Centre de la carte (position actuelle de l'utilisateur). */
  center: Coordinates;
  error?: string;
}

const PICKER_DELTA = 0.01;

export function LocationPicker({ value, onChange, center, error }: LocationPickerProps) {
  const mapRef = useRef<MapView>(null);

  const { latitude, longitude } = center;
  useEffect(() => {
    mapRef.current?.animateToRegion(regionFromCoordinates({ latitude, longitude }, PICKER_DELTA), 500);
  }, [latitude, longitude]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Emplacement</Text>
      <Text style={styles.hint}>Touchez la carte ou déplacez le repère pour choisir l&apos;emplacement.</Text>
      <MapView
        ref={mapRef}
        testID="location-picker-map"
        style={styles.map}
        initialRegion={regionFromCoordinates(value ?? center, PICKER_DELTA)}
        showsUserLocation
        onPress={(event) => onChange(event.nativeEvent.coordinate)}
      >
        {value ? (
          <Marker
            testID="location-picker-marker"
            coordinate={value}
            draggable
            pinColor={colors.primary}
            onDragEnd={(event) => onChange(event.nativeEvent.coordinate)}
          />
        ) : null}
      </MapView>
      {error ? (
        <Text testID="location-picker-error" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  map: {
    height: 220,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  error: {
    marginTop: spacing.xs,
    color: colors.danger,
    fontSize: 13,
  },
});
