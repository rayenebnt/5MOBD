import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/theme';

export interface EmptyStateProps {
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  testID?: string;
}

export function EmptyState({ message, icon = 'location-outline', testID }: EmptyStateProps) {
  return (
    <View testID={testID} style={styles.container}>
      <Ionicons name={icon} size={40} color={colors.textMuted} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  message: {
    marginTop: spacing.sm,
    textAlign: 'center',
    fontSize: 15,
    color: colors.textMuted,
  },
});
