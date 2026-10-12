import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import type { Address } from '@/types/models';

import { PrivacyBadge } from './PrivacyBadge';

export interface AddressCardProps {
  address: Address;
  onPress?: (address: Address) => void;
  /** Affiche l'auteur de l'adresse (adresses des autres utilisateurs). */
  showOwner?: boolean;
}

export function AddressCard({ address, onPress, showOwner = false }: AddressCardProps) {
  return (
    <Pressable
      testID={`address-card-${address.id}`}
      accessibilityRole="button"
      accessibilityLabel={address.name}
      onPress={() => onPress?.(address)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {address.photoURL ? (
        <Image source={{ uri: address.photoURL }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Ionicons name="image-outline" size={28} color={colors.textMuted} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {address.name}
        </Text>
        {address.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {address.description}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <PrivacyBadge isPublic={address.isPublic} />
          {showOwner ? (
            <Text style={styles.owner} numberOfLines={1}>
              par {address.ownerName}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  owner: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 12,
    color: colors.textMuted,
  },
});
