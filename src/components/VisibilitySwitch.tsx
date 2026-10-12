import { StyleSheet, Switch, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

export interface VisibilitySwitchProps {
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
  testID?: string;
}

export function VisibilitySwitch({ isPublic, onChange, testID }: VisibilitySwitchProps) {
  return (
    <View style={styles.container}>
      <View style={styles.texts}>
        <Text style={styles.title}>{isPublic ? 'Adresse publique' : 'Adresse privée'}</Text>
        <Text style={styles.description}>
          {isPublic
            ? 'Visible par tous les utilisateurs, qui peuvent laisser un avis.'
            : 'Visible uniquement par vous.'}
        </Text>
      </View>
      <Switch
        testID={testID}
        accessibilityLabel="Rendre l'adresse publique"
        value={isPublic}
        onValueChange={onChange}
        trackColor={{ true: colors.public, false: colors.border }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  texts: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  description: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
});
