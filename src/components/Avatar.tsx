import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';
import { getInitials } from '@/utils/format';

export interface AvatarProps {
  uri: string | null;
  name: string | null;
  size?: number;
  testID?: string;
}

export function Avatar({ uri, name, size = 48, testID }: AvatarProps) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return (
      <Image
        testID={testID ? `${testID}-image` : undefined}
        source={{ uri }}
        style={[styles.image, dimension]}
        accessibilityLabel={`Photo de profil de ${name ?? 'utilisateur'}`}
      />
    );
  }

  return (
    <View
      testID={testID ? `${testID}-initials` : undefined}
      style={[styles.placeholder, dimension]}
      accessibilityLabel={`Initiales de ${name ?? 'utilisateur'}`}
    >
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.border,
  },
  placeholder: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.primary,
    fontWeight: '700',
  },
});
