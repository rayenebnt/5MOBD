import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

export interface PrivacyBadgeProps {
  isPublic: boolean;
  testID?: string;
}

export function PrivacyBadge({ isPublic, testID }: PrivacyBadgeProps) {
  const color = isPublic ? colors.public : colors.private;
  return (
    <View testID={testID} style={[styles.badge, { borderColor: color }]}>
      <Ionicons name={isPublic ? 'globe-outline' : 'lock-closed-outline'} size={12} color={color} />
      <Text style={[styles.text, { color }]}>{isPublic ? 'Publique' : 'Privée'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    gap: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
