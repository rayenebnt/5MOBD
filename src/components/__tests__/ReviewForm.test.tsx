import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ReviewForm } from '../ReviewForm';

describe('ReviewForm', () => {
  it('valide la note et le commentaire avant envoi', async () => {
    const onSubmit = jest.fn(async () => undefined);
    render(<ReviewForm onSubmit={onSubmit} />);

    fireEvent.press(screen.getByTestId('submit-review-button'));

    expect(await screen.findByTestId('review-rating-error')).toBeOnTheScreen();
    expect(screen.getByTestId('review-comment-input-error')).toHaveTextContent('Le commentaire est obligatoire.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('publie un avis avec note, commentaire et photo puis vide le formulaire', async () => {
    const onSubmit = jest.fn(async () => undefined);
    render(<ReviewForm onSubmit={onSubmit} />);

    fireEvent.press(screen.getByTestId('review-rating-star-5'));
    fireEvent.changeText(screen.getByTestId('review-comment-input'), 'Excellent !');
    fireEvent.press(screen.getByTestId('review-photo-library'));
    await screen.findByTestId('review-photo-preview');
    fireEvent.press(screen.getByTestId('submit-review-button'));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        rating: 5,
        comment: 'Excellent !',
        photoUri: 'file:///library.jpg',
      }),
    );
    await waitFor(() => expect(screen.getByTestId('review-comment-input').props.value).toBe(''));
    expect(screen.queryByTestId('review-photo-preview')).toBeNull();
  });

  it("affiche une erreur si l'envoi échoue", async () => {
    const onSubmit = jest.fn(async () => {
      throw new Error('réseau');
    });
    render(<ReviewForm onSubmit={onSubmit} />);

    fireEvent.press(screen.getByTestId('review-rating-star-3'));
    fireEvent.changeText(screen.getByTestId('review-comment-input'), 'Correct');
    fireEvent.press(screen.getByTestId('submit-review-button'));

    expect(await screen.findByTestId('review-submit-error')).toHaveTextContent(
      "L'avis n'a pas pu être publié. Réessayez.",
    );
  });
});
