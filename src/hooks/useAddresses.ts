import { useEffect, useState } from 'react';

import {
  subscribeToAddress,
  subscribeToMyAddresses,
  subscribeToOthersPublicAddresses,
} from '@/services/addressService';
import type { Address } from '@/types/models';

interface AddressesState {
  addresses: Address[];
  loading: boolean;
  error: Error | null;
}

type ListSubscriber = (
  uid: string,
  onData: (addresses: Address[]) => void,
  onError: (error: Error) => void,
) => () => void;

function useAddressList(subscribe: ListSubscriber, uid: string): AddressesState {
  const [state, setState] = useState<AddressesState>({ addresses: [], loading: true, error: null });

  useEffect(() => {
    setState((previous) => ({ ...previous, loading: true }));
    return subscribe(
      uid,
      (addresses) => setState({ addresses, loading: false, error: null }),
      (error) => setState({ addresses: [], loading: false, error }),
    );
  }, [subscribe, uid]);

  return state;
}

export function useMyAddresses(uid: string): AddressesState {
  return useAddressList(subscribeToMyAddresses, uid);
}

export function useOthersPublicAddresses(uid: string): AddressesState {
  return useAddressList(subscribeToOthersPublicAddresses, uid);
}

interface AddressState {
  address: Address | null;
  loading: boolean;
  error: Error | null;
}

export function useAddress(addressId: string): AddressState {
  const [state, setState] = useState<AddressState>({ address: null, loading: true, error: null });

  useEffect(() => {
    return subscribeToAddress(
      addressId,
      (address) => setState({ address, loading: false, error: null }),
      (error) => setState({ address: null, loading: false, error }),
    );
  }, [addressId]);

  return state;
}
