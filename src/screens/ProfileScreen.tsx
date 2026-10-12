import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { useAuth, useCurrentUser } from '@/context/AuthContext';
import { colors, radius, spacing } from '@/theme';
import { type ImageSource, pickImage } from '@/utils/imagePicker';

export default function ProfileScreen() {
  const user = useCurrentUser();
  const { signOut, updatePhoto, removePhoto } = useAuth();
  const [photoLoading, setPhotoLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const changePhoto = async (source: ImageSource) => {
    try {
      const uri = await pickImage(source, [1, 1]);
      if (!uri) return;
      setPhotoLoading(true);
      await updatePhoto(uri);
    } catch (error) {
      Alert.alert('Photo de profil', (error as Error).message || 'La photo n’a pas pu être enregistrée.');
    } finally {
      setPhotoLoading(false);
    }
  };

  const deletePhoto = async () => {
    setPhotoLoading(true);
    try {
      await removePhoto();
    } catch {
      Alert.alert('Photo de profil', 'La photo n’a pas pu être supprimée.');
    } finally {
      setPhotoLoading(false);
    }
  };

  const onSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      setSigningOut(false);
      Alert.alert('Déconnexion', 'La déconnexion a échoué. Réessayez.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.avatarWrapper}>
          <Avatar testID="profile-avatar" uri={user.photoURL} name={user.displayName} size={120} />
          {photoLoading ? (
            <View style={styles.avatarLoading}>
              <ActivityIndicator testID="profile-photo-loading" color={colors.white} />
            </View>
          ) : null}
        </View>
        <Text testID="profile-name" style={styles.name}>
          {user.displayName || 'Utilisateur'}
        </Text>
        <Text testID="profile-email" style={styles.email}>
          {user.email}
        </Text>

        <Text style={styles.section}>Photo de profil</Text>
        <View style={styles.actions}>
          <Button
            testID="profile-photo-library"
            title="Galerie"
            icon="images-outline"
            variant="secondary"
            disabled={photoLoading}
            onPress={() => changePhoto('library')}
            style={styles.action}
          />
          <Button
            testID="profile-photo-camera"
            title="Photo"
            icon="camera-outline"
            variant="secondary"
            disabled={photoLoading}
            onPress={() => changePhoto('camera')}
            style={styles.action}
          />
        </View>
        {user.photoURL ? (
          <Button
            testID="profile-photo-remove"
            title="Supprimer la photo"
            icon="trash-outline"
            variant="secondary"
            disabled={photoLoading}
            onPress={deletePhoto}
            style={styles.remove}
          />
        ) : null}
      </View>

      <Button
        testID="logout-button"
        title="Se déconnecter"
        icon="log-out-outline"
        variant="danger"
        loading={signingOut}
        onPress={onSignOut}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
  },
  avatarLoading: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  email: {
    color: colors.textMuted,
    marginTop: 2,
  },
  section: {
    alignSelf: 'stretch',
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
  remove: {
    alignSelf: 'stretch',
    marginTop: spacing.sm,
  },
});
