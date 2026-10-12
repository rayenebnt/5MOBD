import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

export function LoadingView({ testID = 'loading-view' }: { testID?: string }) {
  return (
    <View testID={testID} style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
