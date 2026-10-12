import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

export interface RatingStarsProps {
  value: number;
  /** Si fourni, les étoiles deviennent cliquables (saisie d'une note). */
  onChange?: (value: number) => void;
  size?: number;
  testID?: string;
}

const STARS = [1, 2, 3, 4, 5];

export function RatingStars({ value, onChange, size = 18, testID }: RatingStarsProps) {
  return (
    <View
      testID={testID}
      style={styles.row}
      accessibilityLabel={`Note : ${value} sur 5`}
      accessible={!onChange}
    >
      {STARS.map((star) => {
        const icon = (
          <Ionicons
            name={star <= Math.round(value) ? 'star' : 'star-outline'}
            size={size}
            color={colors.star}
          />
        );
        if (!onChange) return <View key={star}>{icon}</View>;
        return (
          <Pressable
            key={star}
            testID={testID ? `${testID}-star-${star}` : undefined}
            accessibilityRole="button"
            accessibilityLabel={`${star} étoile${star > 1 ? 's' : ''}`}
            onPress={() => onChange(star)}
            hitSlop={6}
            style={styles.star}
          >
            {icon}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 6,
  },
});
