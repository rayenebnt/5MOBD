import { getEmulatorHost } from '../emulatorHost';

describe('getEmulatorHost', () => {
  it("utilise l'hôte configuré en priorité (émulateur Android)", () => {
    expect(getEmulatorHost('10.0.2.2', '192.168.1.20:8081')).toBe('10.0.2.2');
  });

  it("utilise l'ordinateur qui sert l'application (vrai téléphone)", () => {
    expect(getEmulatorHost(undefined, '192.168.1.20:8081')).toBe('192.168.1.20');
    expect(getEmulatorHost('', '192.168.1.20:8081')).toBe('192.168.1.20');
  });

  it('se rabat sur localhost', () => {
    expect(getEmulatorHost(undefined, undefined)).toBe('localhost');
    expect(getEmulatorHost(undefined, null)).toBe('localhost');
  });
});
