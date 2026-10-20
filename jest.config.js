/** Tests unitaires et fonctionnels (Jest + React Native Testing Library). */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // tests/ : exécutés contre les émulateurs Firebase (jest.firebase.config.js)
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/tests/', '<rootDir>/.maestro/'],
  transformIgnorePatterns: [
    '/node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|standard-navigation|storybook|@storybook/.*)',
    '/node_modules/react-native-reanimated/plugin/',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!src/**/*.stories.tsx',
    '!src/types/**',
    '!src/testing/**',
    '!src/config/**',
  ],
};
