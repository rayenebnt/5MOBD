import { fireEvent, render, screen } from '@testing-library/react-native';

import { VisibilitySwitch } from '../VisibilitySwitch';

describe('VisibilitySwitch', () => {
  it("bascule entre adresse privée et publique", () => {
    const onChange = jest.fn();
    const { rerender } = render(<VisibilitySwitch testID="switch" isPublic={false} onChange={onChange} />);

    expect(screen.getByText('Adresse privée')).toBeOnTheScreen();
    expect(screen.getByText('Visible uniquement par vous.')).toBeOnTheScreen();

    fireEvent(screen.getByTestId('switch'), 'valueChange', true);
    expect(onChange).toHaveBeenCalledWith(true);

    rerender(<VisibilitySwitch testID="switch" isPublic onChange={onChange} />);
    expect(screen.getByText('Adresse publique')).toBeOnTheScreen();
  });
});
