import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { AddressCard } from '@/components/AddressCard';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { LoadingView } from '@/components/LoadingView';
import { useCurrentUser } from '@/context/AuthContext';
import { useMyAddresses } from '@/hooks/useAddresses';
import { colors, radius, spacing } from '@/theme';

type Filter = 'all' | 'public' | 'private';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'public', label: 'Publiques' },
  { value: 'private', label: 'Privées' },
];

export default function MyAddressesScreen() {
  const user = useCurrentUser();
  const router = useRouter();
  const { addresses, loading, error } = useMyAddresses(user.uid);
  const [filter, setFilter] = useState<Filter>('all');

  const visibleAddresses = useMemo(() => {
    if (filter === 'public') return addresses.filter((address) => address.isPublic);
    if (filter === 'private') return addresses.filter((address) => !address.isPublic);
    return addresses;
  }, [addresses, filter]);

  if (loading) return <LoadingView />;

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {FILTERS.map((item) => {
          const selected = item.value === filter;
          return (
            <Pressable
              key={item.value}
              testID={`filter-${item.value}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setFilter(item.value)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <Text testID="my-addresses-error" style={styles.error}>
          Impossible de charger vos adresses.
        </Text>
      ) : null}

      <FlatList
        testID="my-addresses-list"
        data={visibleAddresses}
        keyExtractor={(address) => address.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <AddressCard address={item} onPress={() => router.push(`/address/${item.id}`)} />
        )}
        ListEmptyComponent={
          <EmptyState
            testID="my-addresses-empty"
            icon="bookmark-outline"
            message="Aucune adresse pour le moment. Ajoutez votre première bonne adresse !"
          />
        }
      />

      <View style={styles.footer}>
        <Button
          testID="my-addresses-add"
          title="Ajouter une adresse"
          icon="add-circle-outline"
          onPress={() => router.push('/address/new')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.primary,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.white,
  },
  list: {
    padding: spacing.md,
    flexGrow: 1,
  },
  error: {
    color: colors.danger,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
