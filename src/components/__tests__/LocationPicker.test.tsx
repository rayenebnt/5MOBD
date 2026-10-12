import { fireEvent, render, screen } from '@testing-library/react-native';
import * as Maps from 'react-native-maps';

import { LocationPicker } from '../LocationPicker';

const { mockAnimateToRegion } = Maps as unknown as { mockAnimateToRegion: jest.Mock };

const center = { latitude: 45.76, longitude: 4.83 };

describe('LocationPicker', () => {
  it('centre la carte sur la position fournie', () => {
    render(<LocationPicker value={null} onChange={jest.fn()} center={center} />);
    expect(mockAnimateToRegion).toHaveBeenCalledWith(expect.objectContaining(center), 500);
  });

  it("place le repère à l'endroit touché sur la carte", () => {
    const onChange = jest.fn();
    render(<LocationPicker value={null} onChange={onChange} center={center} />);

    fireEvent(screen.getByTestId('location-picker-map'), 'press', {
      nativeEvent: { coordinate: { latitude: 45.7, longitude: 4.8 } },
    });
    expect(onChange).toHaveBeenCalledWith({ latitude: 45.7, longitude: 4.8 });
  });

  it('permet de déplacer le repère', () => {
    const onChange = jest.fn();
    render(<LocationPicker value={center} onChange={onChange} center={center} />);

    fireEvent(screen.getByTestId('location-picker-marker'), 'dragEnd', {
      nativeEvent: { coordinate: { latitude: 45.8, longitude: 4.9 } },
    });
    expect(onChange).toHaveBeenCalledWith({ latitude: 45.8, longitude: 4.9 });
  });

  it("affiche l'erreur de validation", () => {
    render(<LocationPicker value={null} onChange={jest.fn()} center={center} error="Choisissez l'emplacement" />);
    expect(screen.getByTestId('location-picker-error')).toHaveTextContent("Choisissez l'emplacement");
  });
});
