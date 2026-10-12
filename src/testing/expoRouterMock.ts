// Mock d'expo-router partagé par les tests d'écrans :
//   jest.mock('expo-router', () => require('@/testing/expoRouterMock'));
import { createElement, type ReactNode } from 'react';
import { Text } from 'react-native';

export const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
};

export const useRouter = () => mockRouter;

export const useLocalSearchParams = jest.fn(() => ({}));

export function Link({ children, href, ...props }: { children: ReactNode; href: string }) {
  return createElement(Text, { ...props, onPress: () => mockRouter.push(href) }, children);
}

export const Stack = {
  Screen: () => null,
};
