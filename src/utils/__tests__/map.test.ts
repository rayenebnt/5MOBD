import { makeAddress } from '@/testing/fixtures';

import { DEFAULT_DELTA, getMarkerKind, regionFromCoordinates } from '../map';

describe('regionFromCoordinates', () => {
  it('construit une région centrée sur les coordonnées', () => {
    expect(regionFromCoordinates({ latitude: 45, longitude: 4 })).toEqual({
      latitude: 45,
      longitude: 4,
      latitudeDelta: DEFAULT_DELTA,
      longitudeDelta: DEFAULT_DELTA,
    });
    expect(regionFromCoordinates({ latitude: 1, longitude: 2 }, 0.01).latitudeDelta).toBe(0.01);
  });
});

describe('getMarkerKind', () => {
  it('distingue mes adresses publiques, privées et celles des autres', () => {
    expect(getMarkerKind(makeAddress({ ownerId: 'me', isPublic: true }), 'me')).toBe('mine-public');
    expect(getMarkerKind(makeAddress({ ownerId: 'me', isPublic: false }), 'me')).toBe('mine-private');
    expect(getMarkerKind(makeAddress({ ownerId: 'other' }), 'me')).toBe('other');
  });
});
