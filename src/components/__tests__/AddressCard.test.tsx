import { fireEvent, render, screen } from '@testing-library/react-native';

import { makeAddress } from '@/testing/fixtures';

import { AddressCard } from '../AddressCard';

describe('AddressCard', () => {
  it("affiche le nom, la description et la visibilité de l'adresse", () => {
    render(<AddressCard address={makeAddress({ isPublic: false })} />);

    expect(screen.getByText('Le Petit Bistrot')).toBeOnTheScreen();
    expect(screen.getByText('Cuisine maison et terrasse ensoleillée.')).toBeOnTheScreen();
    expect(screen.getByText('Privée')).toBeOnTheScreen();
    expect(screen.queryByText(/^par /)).toBeNull();
  });

  it("affiche l'auteur pour les adresses des autres", () => {
    render(<AddressCard address={makeAddress({ ownerName: 'Bob Durand' })} showOwner />);
    expect(screen.getByText('par Bob Durand')).toBeOnTheScreen();
  });

  it("transmet l'adresse au clic", () => {
    const onPress = jest.fn();
    const address = makeAddress();
    render(<AddressCard address={address} onPress={onPress} />);

    fireEvent.press(screen.getByTestId('address-card-address-1'));
    expect(onPress).toHaveBeenCalledWith(address);
  });
});
