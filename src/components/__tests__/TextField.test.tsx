import { fireEvent, render, screen } from '@testing-library/react-native';

import { TextField } from '../TextField';

describe('TextField', () => {
  it('affiche le libellé et transmet la saisie', async () => {
    const onChangeText = jest.fn();
    await render(<TextField testID="name" label="Nom" value="" onChangeText={onChangeText} />);

    expect(screen.getByText('Nom')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('Nom'), 'Bistrot');
    expect(onChangeText).toHaveBeenCalledWith('Bistrot');
  });

  it("affiche le message d'erreur", async () => {
    await render(<TextField testID="name" label="Nom" error="Le nom est obligatoire." />);
    expect(screen.getByTestId('name-error')).toHaveTextContent('Le nom est obligatoire.');
  });
});
