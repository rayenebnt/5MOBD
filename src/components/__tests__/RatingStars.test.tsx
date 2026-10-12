import { fireEvent, render, screen } from '@testing-library/react-native';

import { RatingStars } from '../RatingStars';

describe('RatingStars', () => {
  it('affiche une note en lecture seule', () => {
    render(<RatingStars testID="rating" value={3} />);
    expect(screen.getByLabelText('Note : 3 sur 5')).toBeOnTheScreen();
    expect(screen.queryByTestId('rating-star-1')).toBeNull();
  });

  it('permet de choisir une note', () => {
    const onChange = jest.fn();
    render(<RatingStars testID="rating" value={0} onChange={onChange} />);

    fireEvent.press(screen.getByTestId('rating-star-4'));
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
