import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { colors } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: IconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} color={color} size={size} />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Carte', tabBarIcon: tabIcon('map-outline'), tabBarButtonTestID: 'tab-map' }}
      />
      <Tabs.Screen
        name="my-addresses"
        options={{
          title: 'Mes adresses',
          tabBarIcon: tabIcon('bookmark-outline'),
          tabBarButtonTestID: 'tab-my-addresses',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorer',
          tabBarIcon: tabIcon('people-outline'),
          tabBarButtonTestID: 'tab-explore',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: tabIcon('person-circle-outline'),
          tabBarButtonTestID: 'tab-profile',
        }}
      />
    </Tabs>
  );
}
