import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { AddressCard } from '@/components/AddressCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingView } from '@/components/LoadingView';
import { useCurrentUser } from '@/context/AuthContext';
import { useOthersPublicAddresses } from '@/hooks/useAddresses';
import { colors, spacing } from '@/theme';

export default function ExploreScreen() {
  const user = useCurrentUser();
  const router = useRouter();
  const { addresses, loading, error } = useOthersPublicAddresses(user.uid);

  if (loading) return <LoadingView />;

  return (
    <View style={styles.container}>
      {error ? (
        <Text testID="explore-error" style={styles.error}>
          Impossible de charger les adresses publiques.
        </Text>
      ) : null}
      <FlatList
        testID="explore-list"
        data={addresses}
        keyExtractor={(address) => address.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.intro}>Les adresses publiques partagées par les autres utilisateurs.</Text>
        }
        renderItem={({ item }) => (
          <AddressCard address={item} showOwner onPress={() => router.push(`/address/${item.id}`)} />
        )}
        ListEmptyComponent={
          <EmptyState
            testID="explore-empty"
            icon="people-outline"
            message="Aucune adresse publique partagée pour le moment."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
    flexGrow: 1,
  },
  intro: {
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
});
