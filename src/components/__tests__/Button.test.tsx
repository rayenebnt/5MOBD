import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from '../Button';

describe('Button', () => {
  it('affiche le titre et déclenche onPress', () => {
    const onPress = jest.fn();
    render(<Button title="Enregistrer" onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('est inactif quand il est désactivé', () => {
    const onPress = jest.fn();
    render(<Button title="Enregistrer" onPress={onPress} disabled />);

    const button = screen.getByRole('button', { name: 'Enregistrer' });
    expect(button).toBeDisabled();
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('affiche un indicateur de chargement', () => {
    const onPress = jest.fn();
    render(<Button testID="save" title="Enregistrer" onPress={onPress} loading />);

    expect(screen.getByTestId('save-loading')).toBeOnTheScreen();
    expect(screen.queryByText('Enregistrer')).toBeNull();
    fireEvent.press(screen.getByTestId('save'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
