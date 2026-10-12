import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Alert, type AlertButton } from 'react-native';

import * as addressService from '@/services/addressService';
import * as reviewService from '@/services/reviewService';
import { mockRouter, useLocalSearchParams } from '@/testing/expoRouterMock';
import { currentUser, makeAddress, makeReview } from '@/testing/fixtures';
import { renderWithAuth } from '@/testing/render';
import type { Address, Review } from '@/types/models';

import AddressDetailScreen from '../AddressDetailScreen';

jest.mock('expo-router', () => require('@/testing/expoRouterMock'));
jest.mock('@/services/addressService', () => ({
  subscribeToAddress: jest.fn(),
  deleteAddress: jest.fn(async () => undefined),
}));
jest.mock('@/services/reviewService', () => ({
  subscribeToReviews: jest.fn(),
  addReview: jest.fn(async () => 'review-id'),
}));

const mockedAddressService = addressService as jest.Mocked<typeof addressService>;
const mockedReviewService = reviewService as jest.Mocked<typeof reviewService>;

function setup(address: Address | null, reviews: Review[] = []) {
  useLocalSearchParams.mockReturnValue({ id: address?.id ?? 'unknown' });
  mockedAddressService.subscribeToAddress.mockImplementation((_id, onData) => {
    onData(address);
    return jest.fn();
  });
  mockedReviewService.subscribeToReviews.mockImplementation((_id, onData) => {
    onData(reviews);
    return jest.fn();
  });
}

describe("Détail d'une adresse", () => {
  it("affiche le nom, la photo et la description de l'adresse", () => {
    setup(makeAddress());
    renderWithAuth(<AddressDetailScreen />);

    expect(screen.getByTestId('address-name')).toHaveTextContent('Le Petit Bistrot');
    expect(screen.getByTestId('address-description')).toHaveTextContent('Cuisine maison et terrasse ensoleillée.');
    expect(screen.getByTestId('address-photo-image')).toBeOnTheScreen();
    expect(screen.getByText('Publique')).toBeOnTheScreen();
  });

  describe('suppression', () => {
    it("le propriétaire supprime son adresse après confirmation", async () => {
      const address = makeAddress();
      setup(address);
      const alert = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
        (buttons as AlertButton[]).find((button) => button.style === 'destructive')?.onPress?.();
      });
      renderWithAuth(<AddressDetailScreen />);

      fireEvent.press(screen.getByTestId('delete-address-button'));

      expect(alert).toHaveBeenCalledWith('Supprimer cette adresse ?', expect.any(String), expect.any(Array));
      await waitFor(() => expect(mockedAddressService.deleteAddress).toHaveBeenCalledWith(address));
      expect(mockRouter.back).toHaveBeenCalled();
    });

    it("ne supprime rien si l'utilisateur annule", () => {
      setup(makeAddress());
      jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
      renderWithAuth(<AddressDetailScreen />);

      fireEvent.press(screen.getByTestId('delete-address-button'));
      expect(mockedAddressService.deleteAddress).not.toHaveBeenCalled();
    });

    it("n'est pas proposée sur l'adresse d'un autre utilisateur", () => {
      setup(makeAddress({ ownerId: 'user-2', ownerName: 'Bob' }));
      renderWithAuth(<AddressDetailScreen />);

      expect(screen.queryByTestId('delete-address-button')).toBeNull();
      expect(screen.getByText(/Ajoutée par Bob/)).toBeOnTheScreen();
    });
  });

  describe('avis', () => {
    const othersAddress = makeAddress({ id: 'b1', ownerId: 'user-2', ownerName: 'Bob' });

    it('affiche les avis, leur moyenne et leurs photos', () => {
      setup(othersAddress, [
        makeReview({ id: 'r1', rating: 5, comment: 'Parfait', photoURL: 'https://cdn.example.com/r1.jpg' }),
        makeReview({ id: 'r2', rating: 4, comment: 'Bien' }),
      ]);
      renderWithAuth(<AddressDetailScreen />);

      expect(screen.getByText('Parfait')).toBeOnTheScreen();
      expect(screen.getByText('Bien')).toBeOnTheScreen();
      expect(screen.getByTestId('review-r1-photo')).toBeOnTheScreen();
      expect(screen.getByTestId('reviews-summary')).toBeOnTheScreen();
      expect(screen.getByText('4.5 / 5 · 2 avis')).toBeOnTheScreen();
    });

    it("permet de laisser un avis sur l'adresse publique d'un autre", async () => {
      setup(othersAddress);
      renderWithAuth(<AddressDetailScreen />);

      expect(screen.getByTestId('reviews-empty')).toBeOnTheScreen();
      fireEvent.press(screen.getByTestId('review-rating-star-4'));
      fireEvent.changeText(screen.getByTestId('review-comment-input'), 'Très sympa');
      fireEvent.press(screen.getByTestId('submit-review-button'));

      await waitFor(() =>
        expect(mockedReviewService.addReview).toHaveBeenCalledWith('b1', currentUser, {
          rating: 4,
          comment: 'Très sympa',
          photoUri: null,
        }),
      );
    });

    it("le propriétaire voit les avis mais ne peut pas noter sa propre adresse", () => {
      setup(makeAddress(), [makeReview()]);
      renderWithAuth(<AddressDetailScreen />);

      expect(screen.getByText('Très bon accueil, je recommande !')).toBeOnTheScreen();
      expect(screen.queryByTestId('review-form')).toBeNull();
    });

    it("une adresse privée ne reçoit pas d'avis", () => {
      setup(makeAddress({ isPublic: false }));
      renderWithAuth(<AddressDetailScreen />);

      expect(screen.getByTestId('reviews-private')).toBeOnTheScreen();
      expect(screen.queryByTestId('review-form')).toBeNull();
      expect(mockedReviewService.subscribeToReviews).not.toHaveBeenCalled();
    });
  });

  it("indique qu'une adresse est introuvable ou privée", () => {
    setup(null);
    renderWithAuth(<AddressDetailScreen />);
    expect(screen.getByTestId('address-not-found')).toBeOnTheScreen();
  });
});
