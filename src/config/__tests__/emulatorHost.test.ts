import { getEmulatorHost, withEmulatorHost } from '../emulatorHost';

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

describe('withEmulatorHost', () => {
  const url = 'http://192.168.1.20:9199/v0/b/demo.appspot.com/o/users%2Fu1%2Favatar.jpg?alt=media&token=abc';

  it("remplace l'adresse de l'ordinateur dans les URL du Storage Emulator", () => {
    expect(withEmulatorHost(url, '172.20.10.2')).toBe(
      'http://172.20.10.2:9199/v0/b/demo.appspot.com/o/users%2Fu1%2Favatar.jpg?alt=media&token=abc',
    );
    expect(withEmulatorHost('http://10.0.2.2:9199/v0/b/x/o/y', '192.168.1.5')).toBe(
      'http://192.168.1.5:9199/v0/b/x/o/y',
    );
  });

  it('ne touche pas aux autres URL ni sans émulateur', () => {
    const real = 'https://firebasestorage.googleapis.com/v0/b/x/o/y?alt=media';
    expect(withEmulatorHost(real, '172.20.10.2')).toBe(real);
    expect(withEmulatorHost(url, null)).toBe(url);
    expect(withEmulatorHost(null, '172.20.10.2')).toBeNull();
  });
});
