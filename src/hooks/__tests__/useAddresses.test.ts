import { act, renderHook } from '@testing-library/react-native';

import * as addressService from '@/services/addressService';
import { makeAddress } from '@/testing/fixtures';

import { useAddress, useMyAddresses, useOthersPublicAddresses } from '../useAddresses';

jest.mock('@/services/addressService', () => ({
  subscribeToMyAddresses: jest.fn(),
  subscribeToOthersPublicAddresses: jest.fn(),
  subscribeToAddress: jest.fn(),
}));

const mocked = addressService as jest.Mocked<typeof addressService>;

describe('useMyAddresses', () => {
  it("s'abonne aux adresses de l'utilisateur et se désabonne au démontage", () => {
    const unsubscribe = jest.fn();
    let push: (addresses: ReturnType<typeof makeAddress>[]) => void = () => undefined;
    mocked.subscribeToMyAddresses.mockImplementation((_uid, onData) => {
      push = onData;
      return unsubscribe;
    });

    const { result, unmount } = renderHook(() => useMyAddresses('user-1'));
    expect(result.current.loading).toBe(true);

    act(() => push([makeAddress()]));
    expect(result.current).toMatchObject({ loading: false, error: null });
    expect(result.current.addresses).toHaveLength(1);
    expect(mocked.subscribeToMyAddresses).toHaveBeenCalledWith('user-1', expect.any(Function), expect.any(Function));

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('expose les erreurs', () => {
    const error = new Error('permission-denied');
    mocked.subscribeToOthersPublicAddresses.mockImplementation((_uid, _onData, onError) => {
      onError?.(error);
      return jest.fn();
    });

    const { result } = renderHook(() => useOthersPublicAddresses('user-1'));
    expect(result.current).toEqual({ addresses: [], loading: false, error });
  });
});

describe('useAddress', () => {
  it("renvoie l'adresse demandée", () => {
    const address = makeAddress({ id: 'a1' });
    mocked.subscribeToAddress.mockImplementation((_id, onData) => {
      onData(address);
      return jest.fn();
    });

    const { result } = renderHook(() => useAddress('a1'));
    expect(result.current).toEqual({ address, loading: false, error: null });
  });
});
