import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import type { Review } from '@/types/models';
import { formatDate } from '@/utils/format';

import { Avatar } from './Avatar';
import { RatingStars } from './RatingStars';

export interface ReviewItemProps {
  review: Review;
}

export function ReviewItem({ review }: ReviewItemProps) {
  return (
    <View testID={`review-${review.id}`} style={styles.container}>
      <View style={styles.header}>
        <Avatar uri={review.authorPhotoURL} name={review.authorName} size={36} />
        <View style={styles.headerText}>
          <Text style={styles.author}>{review.authorName}</Text>
          <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
        </View>
        <RatingStars value={review.rating} size={14} />
      </View>
      <Text style={styles.comment}>{review.comment}</Text>
      {review.photoURL ? (
        <Image
          testID={`review-${review.id}-photo`}
          source={{ uri: review.photoURL }}
          style={styles.photo}
          accessibilityLabel="Photo jointe à l'avis"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  author: {
    fontWeight: '600',
    color: colors.text,
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
  },
  comment: {
    marginTop: spacing.sm,
    fontSize: 15,
    color: colors.text,
  },
  photo: {
    marginTop: spacing.sm,
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
});
