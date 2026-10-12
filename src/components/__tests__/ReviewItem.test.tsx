import { render, screen } from '@testing-library/react-native';

import { makeReview } from '@/testing/fixtures';

import { ReviewItem } from '../ReviewItem';

describe('ReviewItem', () => {
  it("affiche l'auteur, la note et le commentaire", () => {
    render(<ReviewItem review={makeReview()} />);

    expect(screen.getByText('Bob Durand')).toBeOnTheScreen();
    expect(screen.getByLabelText('Note : 4 sur 5')).toBeOnTheScreen();
    expect(screen.getByText('Très bon accueil, je recommande !')).toBeOnTheScreen();
    expect(screen.queryByTestId('review-review-1-photo')).toBeNull();
  });

  it("affiche la photo jointe à l'avis", () => {
    render(<ReviewItem review={makeReview({ photoURL: 'https://cdn.example.com/r.jpg' })} />);
    expect(screen.getByTestId('review-review-1-photo').props.source).toEqual({
      uri: 'https://cdn.example.com/r.jpg',
    });
  });
});
