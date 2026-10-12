const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const withStorybook = require('@storybook/react-native/metro/withStorybook');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = withStorybook(config, {
  // Storybook n'est actif que via `npm run storybook`
  enabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true',
  // Storybook désactivé : ses paquets sont exclus du bundle de l'application
  onDisabledRemoveStorybook: true,
  configPath: path.resolve(__dirname, './.rnstorybook'),
});
