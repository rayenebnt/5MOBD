import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { LoadingView } from '@/components/LoadingView';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { colors } from '@/theme';

function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) return <LoadingView testID="app-loading" />;

  const isSignedIn = user !== null;

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Écrans accessibles uniquement une fois connecté */}
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="address/new" options={{ title: 'Nouvelle adresse' }} />
        <Stack.Screen name="address/[id]" options={{ title: 'Adresse' }} />
      </Stack.Protected>

      {/* Écrans accessibles uniquement déconnecté */}
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ title: 'Inscription' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthProvider>
  );
}
