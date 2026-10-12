import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

import { PhotoPicker } from '../PhotoPicker';

const mockedPicker = ImagePicker as jest.Mocked<typeof ImagePicker>;

describe('PhotoPicker', () => {
  it('choisit une photo dans la galerie', async () => {
    const onChange = jest.fn();
    render(<PhotoPicker label="Photo" uri={null} onChange={onChange} />);

    expect(screen.getByText('Aucune photo')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('photo-picker-library'));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('file:///library.jpg'));
  });

  it("prend une photo avec l'appareil photo", async () => {
    const onChange = jest.fn();
    render(<PhotoPicker label="Photo" uri={null} onChange={onChange} />);

    fireEvent.press(screen.getByTestId('photo-picker-camera'));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('file:///camera.jpg'));
  });

  it('affiche la photo choisie et permet de la retirer', () => {
    const onChange = jest.fn();
    render(<PhotoPicker label="Photo" uri="file:///p.jpg" onChange={onChange} />);

    expect(screen.getByTestId('photo-picker-preview')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('photo-picker-remove'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('prévient si la permission est refusée', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    mockedPicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({ granted: false } as never);
    const onChange = jest.fn();
    render(<PhotoPicker label="Photo" uri={null} onChange={onChange} />);

    fireEvent.press(screen.getByTestId('photo-picker-library'));
    await waitFor(() => expect(alert).toHaveBeenCalledWith('Photo', "L'accès aux photos a été refusé."));
    expect(onChange).not.toHaveBeenCalled();
  });
});
