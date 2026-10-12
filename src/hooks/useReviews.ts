import { useEffect, useState } from 'react';

import { subscribeToReviews } from '@/services/reviewService';
import type { Review } from '@/types/models';

interface ReviewsState {
  reviews: Review[];
  loading: boolean;
  error: Error | null;
}

/** Avis d'une adresse (uniquement pour les adresses publiques : `enabled`). */
export function useReviews(addressId: string, enabled: boolean): ReviewsState {
  const [state, setState] = useState<ReviewsState>({ reviews: [], loading: enabled, error: null });

  useEffect(() => {
    if (!enabled) {
      setState({ reviews: [], loading: false, error: null });
      return undefined;
    }
    return subscribeToReviews(
      addressId,
      (reviews) => setState({ reviews, loading: false, error: null }),
      (error) => setState({ reviews: [], loading: false, error }),
    );
  }, [addressId, enabled]);

  return state;
}
