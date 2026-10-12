import { fireEvent, render, screen } from '@testing-library/react-native';

import { TextField } from '../TextField';

describe('TextField', () => {
  it('affiche le libellé et transmet la saisie', () => {
    const onChangeText = jest.fn();
    render(<TextField testID="name" label="Nom" value="" onChangeText={onChangeText} />);

    expect(screen.getByText('Nom')).toBeOnTheScreen();
    fireEvent.changeText(screen.getByLabelText('Nom'), 'Bistrot');
    expect(onChangeText).toHaveBeenCalledWith('Bistrot');
  });

  it("affiche le message d'erreur", () => {
    render(<TextField testID="name" label="Nom" error="Le nom est obligatoire." />);
    expect(screen.getByTestId('name-error')).toHaveTextContent('Le nom est obligatoire.');
  });
});
