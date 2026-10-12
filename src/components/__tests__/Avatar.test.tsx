import { render, screen } from '@testing-library/react-native';

import { Avatar } from '../Avatar';

describe('Avatar', () => {
  it('affiche la photo de profil', () => {
    render(<Avatar testID="avatar" uri="https://cdn.example.com/me.jpg" name="Alice Martin" />);
    expect(screen.getByTestId('avatar-image').props.source).toEqual({ uri: 'https://cdn.example.com/me.jpg' });
  });

  it('affiche les initiales sans photo', () => {
    render(<Avatar testID="avatar" uri={null} name="Alice Martin" />);
    expect(screen.getByTestId('avatar-initials')).toBeOnTheScreen();
    expect(screen.getByText('AM')).toBeOnTheScreen();
  });
});
