import { render, screen } from '@testing-library/react-native';

import { PrivacyBadge } from '../PrivacyBadge';

describe('PrivacyBadge', () => {
  it('indique une adresse publique', () => {
    render(<PrivacyBadge isPublic />);
    expect(screen.getByText('Publique')).toBeOnTheScreen();
  });

  it('indique une adresse privée', () => {
    render(<PrivacyBadge isPublic={false} />);
    expect(screen.getByText('Privée')).toBeOnTheScreen();
  });
});
