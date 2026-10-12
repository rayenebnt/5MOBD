import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/Button';
import { LocationPicker } from '@/components/LocationPicker';
import { PhotoPicker } from '@/components/PhotoPicker';
import { TextField } from '@/components/TextField';
import { VisibilitySwitch } from '@/components/VisibilitySwitch';
import { useCurrentUser } from '@/context/AuthContext';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { createAddress } from '@/services/addressService';
import { colors, spacing } from '@/theme';
import type { Coordinates } from '@/types/models';
import { DEFAULT_COORDINATES } from '@/utils/map';
import { type FormErrors, hasErrors, validateAddress } from '@/utils/validation';

type AddressField = 'name' | 'description' | 'location';

export default function NewAddressScreen() {
  const user = useCurrentUser();
  const router = useRouter();
  const { location } = useCurrentLocation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [errors, setErrors] = useState<FormErrors<AddressField>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Par défaut, l'adresse est placée à la position actuelle de l'utilisateur
  useEffect(() => {
    if (location) setCoordinates((current) => current ?? location);
  }, [location]);

  const onSubmit = async () => {
    const validation = validateAddress({
      name,
      description,
      latitude: coordinates?.latitude ?? null,
      longitude: coordinates?.longitude ?? null,
    });
    setErrors(validation);
    setSubmitError(null);
    if (hasErrors(validation) || !coordinates) return;

    setSaving(true);
    try {
      await createAddress(user, {
        name,
        description,
        isPublic,
        photoUri,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });
      router.back();
    } catch {
      setSubmitError("L'adresse n'a pas pu être enregistrée. Réessayez.");
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField
          testID="address-name-input"
          label="Nom"
          value={name}
          onChangeText={setName}
          error={errors.name}
          placeholder="Ex. : Le petit bistrot"
        />
        <TextField
          testID="address-description-input"
          label="Description"
          value={description}
          onChangeText={setDescription}
          error={errors.description}
          placeholder="Pourquoi est-ce une bonne adresse ?"
          multiline
        />
        <PhotoPicker testID="address-photo" label="Photo" uri={photoUri} onChange={setPhotoUri} />
        <VisibilitySwitch testID="address-public-switch" isPublic={isPublic} onChange={setIsPublic} />
        <LocationPicker
          value={coordinates}
          onChange={setCoordinates}
          center={location ?? DEFAULT_COORDINATES}
          error={errors.location}
        />

        {submitError ? (
          <Text testID="address-submit-error" style={styles.submitError}>
            {submitError}
          </Text>
        ) : null}

        <Button
          testID="save-address-button"
          title="Enregistrer l'adresse"
          icon="checkmark-circle-outline"
          onPress={onSubmit}
          loading={saving}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  submitError: {
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});
