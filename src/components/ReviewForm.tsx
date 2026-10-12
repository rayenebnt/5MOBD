import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import type { NewReviewInput } from '@/types/models';
import { type FormErrors, hasErrors, validateReview } from '@/utils/validation';

import { Button } from './Button';
import { PhotoPicker } from './PhotoPicker';
import { RatingStars } from './RatingStars';
import { TextField } from './TextField';

export interface ReviewFormProps {
  onSubmit: (review: NewReviewInput) => Promise<void>;
}

export function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors<'rating' | 'comment'>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const validation = validateReview({ rating, comment });
    setErrors(validation);
    setSubmitError(null);
    if (hasErrors(validation)) return;

    setSending(true);
    try {
      await onSubmit({ rating, comment, photoUri });
      setRating(0);
      setComment('');
      setPhotoUri(null);
    } catch {
      setSubmitError("L'avis n'a pas pu être publié. Réessayez.");
    } finally {
      setSending(false);
    }
  };

  return (
    <View testID="review-form" style={styles.container}>
      <Text style={styles.title}>Laisser un avis</Text>
      <Text style={styles.label}>Note</Text>
      <RatingStars testID="review-rating" value={rating} onChange={setRating} size={30} />
      {errors.rating ? (
        <Text testID="review-rating-error" style={styles.error}>
          {errors.rating}
        </Text>
      ) : null}
      <View style={styles.spacer} />
      <TextField
        testID="review-comment-input"
        label="Commentaire"
        value={comment}
        onChangeText={setComment}
        error={errors.comment}
        placeholder="Partagez votre expérience"
        multiline
      />
      <PhotoPicker testID="review-photo" label="Photo (facultatif)" uri={photoUri} onChange={setPhotoUri} />
      {submitError ? (
        <Text testID="review-submit-error" style={styles.error}>
          {submitError}
        </Text>
      ) : null}
      <Button
        testID="submit-review-button"
        title="Publier l'avis"
        icon="send-outline"
        onPress={submit}
        loading={sending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  spacer: {
    height: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
});
