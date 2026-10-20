import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { LoadingView } from '@/components/LoadingView';
import { PrivacyBadge } from '@/components/PrivacyBadge';
import { RatingStars } from '@/components/RatingStars';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewItem } from '@/components/ReviewItem';
import { useCurrentUser } from '@/context/AuthContext';
import { useAddress } from '@/hooks/useAddresses';
import { useReviews } from '@/hooks/useReviews';
import { deleteAddress } from '@/services/addressService';
import { addReview } from '@/services/reviewService';
import { colors, radius, spacing } from '@/theme';
import type { Address, NewReviewInput } from '@/types/models';
import { averageRating, formatDate } from '@/utils/format';
import { regionFromCoordinates } from '@/utils/map';

export default function AddressDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useCurrentUser();
  const router = useRouter();
  const { address, loading } = useAddress(id);
  const { reviews } = useReviews(id, address?.isPublic === true);
  const [deleting, setDeleting] = useState(false);

  if (loading) return <LoadingView />;
  if (!address) {
    // Suppression en cours : Firestore signale l'adresse supprimée avant le retour en arrière
    if (deleting) return <LoadingView />;
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Adresse' }} />
        <EmptyState
          testID="address-not-found"
          icon="alert-circle-outline"
          message="Cette adresse n'existe pas ou n'est pas accessible."
        />
      </View>
    );
  }

  const isOwner = address.ownerId === user.uid;
  const average = averageRating(reviews.map((review) => review.rating));

  const remove = async (target: Address) => {
    setDeleting(true);
    try {
      await deleteAddress(target);
      router.back();
    } catch {
      setDeleting(false);
      Alert.alert('Suppression', "L'adresse n'a pas pu être supprimée.");
    }
  };

  const confirmDelete = () => {
    Alert.alert('Supprimer cette adresse ?', `« ${address.name} » et ses avis seront supprimés.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => remove(address) },
    ]);
  };

  const submitReview = async (review: NewReviewInput) => {
    await addReview(address.id, user, review);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: address.name }} />

      {address.photoURL ? (
        <Image testID="address-photo-image" source={{ uri: address.photoURL }} style={styles.photo} />
      ) : null}

      <View style={styles.card}>
        <Text testID="address-name" style={styles.name}>
          {address.name}
        </Text>
        <View style={styles.meta}>
          <PrivacyBadge testID="address-privacy" isPublic={address.isPublic} />
          <Text style={styles.metaText}>
            {isOwner ? 'Ajoutée par vous' : `Ajoutée par ${address.ownerName}`}
            {address.createdAt ? ` · ${formatDate(address.createdAt)}` : ''}
          </Text>
        </View>
        {address.description ? (
          <Text testID="address-description" style={styles.description}>
            {address.description}
          </Text>
        ) : null}
      </View>

      <MapView
        testID="address-map"
        style={styles.map}
        initialRegion={regionFromCoordinates(address, 0.01)}
        scrollEnabled={false}
        zoomEnabled={false}
      >
        <Marker coordinate={{ latitude: address.latitude, longitude: address.longitude }} title={address.name} />
      </MapView>

      {isOwner ? (
        <Button
          testID="delete-address-button"
          title="Supprimer l'adresse"
          icon="trash-outline"
          variant="danger"
          loading={deleting}
          onPress={confirmDelete}
          style={styles.deleteButton}
        />
      ) : null}

      <Text style={styles.sectionTitle}>Avis</Text>
      {address.isPublic ? (
        <>
          {average !== null ? (
            <View testID="reviews-summary" style={styles.summary}>
              <RatingStars value={average} />
              <Text style={styles.summaryText}>
                {average.toFixed(1)} / 5 · {reviews.length} avis
              </Text>
            </View>
          ) : null}
          {reviews.length === 0 ? (
            <EmptyState testID="reviews-empty" icon="chatbubbles-outline" message="Aucun avis pour le moment." />
          ) : (
            reviews.map((review) => <ReviewItem key={review.id} review={review} />)
          )}
          {!isOwner ? <ReviewForm onSubmit={submitReview} /> : null}
        </>
      ) : (
        <Text testID="reviews-private" style={styles.privateText}>
          Adresse privée : elle n&apos;est visible que par vous et ne peut pas recevoir d&apos;avis.
        </Text>
      )}
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
    paddingBottom: spacing.xl,
  },
  photo: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.border,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  description: {
    marginTop: spacing.md,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  map: {
    height: 180,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  deleteButton: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  summaryText: {
    color: colors.textMuted,
  },
  privateText: {
    color: colors.textMuted,
  },
});
