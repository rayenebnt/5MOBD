// Mocks globaux des modules natifs utilisés par l'application.

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Firebase n'est jamais contacté pendant les tests : la configuration et le SDK
// sont simulés (les tests des services précisent le comportement attendu).
jest.mock('@/config/firebase', () => ({
  app: {},
  auth: { currentUser: null },
  db: {},
  storage: {},
}));
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(() => jest.fn()),
  updateProfile: jest.fn(),
}));
jest.mock('firebase/firestore', () => require('@/testing/firestoreMock').firestoreMock);
jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
}));

// Les icônes chargent une police de façon asynchrone : on les remplace par un simple texte
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const Ionicons = ({ name, ...props }: { name: string }) => React.createElement(Text, props, name);
  Ionicons.glyphMap = {};
  return { Ionicons };
});

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const mockAnimateToRegion = jest.fn();

  const MapView = React.forwardRef(
    (props: Record<string, unknown> & { children?: unknown }, ref: unknown) => {
      React.useImperativeHandle(ref, () => ({ animateToRegion: mockAnimateToRegion }));
      return React.createElement(View, props, props.children);
    },
  );
  MapView.displayName = 'MapView';
  const Marker = (props: Record<string, unknown>) => React.createElement(View, props);

  return { __esModule: true, default: MapView, Marker, mockAnimateToRegion };
});

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted', granted: true })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: 45.764, longitude: 4.8357 },
  })),
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchCameraAsync: jest.fn(async () => ({
    canceled: false,
    assets: [{ uri: 'file:///camera.jpg' }],
  })),
  launchImageLibraryAsync: jest.fn(async () => ({
    canceled: false,
    assets: [{ uri: 'file:///library.jpg' }],
  })),
}));

beforeEach(() => {
  jest.clearAllMocks();
});
