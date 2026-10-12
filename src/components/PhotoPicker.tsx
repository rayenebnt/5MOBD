import { Ionicons } from '@expo/vector-icons';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { type ImageSource, pickImage } from '@/utils/imagePicker';

import { Button } from './Button';

export interface PhotoPickerProps {
  label: string;
  uri: string | null;
  onChange: (uri: string | null) => void;
  testID?: string;
}

export function PhotoPicker({ label, uri, onChange, testID = 'photo-picker' }: PhotoPickerProps) {
  const choose = async (source: ImageSource) => {
    try {
      const pickedUri = await pickImage(source);
      if (pickedUri) onChange(pickedUri);
    } catch (error) {
      Alert.alert('Photo', (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {uri ? (
        <Image testID={`${testID}-preview`} source={{ uri }} style={styles.preview} />
      ) : (
        <View style={[styles.preview, styles.placeholder]}>
          <Ionicons name="camera-outline" size={32} color={colors.textMuted} />
          <Text style={styles.placeholderText}>Aucune photo</Text>
        </View>
      )}
      <View style={styles.actions}>
        <Button
          testID={`${testID}-library`}
          title="Galerie"
          icon="images-outline"
          variant="secondary"
          onPress={() => choose('library')}
          style={styles.action}
        />
        <Button
          testID={`${testID}-camera`}
          title="Photo"
          icon="camera-outline"
          variant="secondary"
          onPress={() => choose('camera')}
          style={styles.action}
        />
        {uri ? (
          <Button
            testID={`${testID}-remove`}
            title="Retirer"
            icon="trash-outline"
            variant="danger"
            onPress={() => onChange(null)}
            style={styles.action}
          />
        ) : null}
      </View>
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
    marginBottom: spacing.xs,
  },
  preview: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  placeholderText: {
    marginTop: spacing.xs,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
