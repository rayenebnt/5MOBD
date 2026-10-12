import { renderHook } from '@testing-library/react-native';

import * as reviewService from '@/services/reviewService';
import { makeReview } from '@/testing/fixtures';

import { useReviews } from '../useReviews';

jest.mock('@/services/reviewService', () => ({
  subscribeToReviews: jest.fn(),
}));

const mocked = reviewService as jest.Mocked<typeof reviewService>;

describe('useReviews', () => {
  it("charge les avis d'une adresse publique", () => {
    const reviews = [makeReview()];
    mocked.subscribeToReviews.mockImplementation((_id, onData) => {
      onData(reviews);
      return jest.fn();
    });

    const { result } = renderHook(() => useReviews('a1', true));
    expect(result.current).toEqual({ reviews, loading: false, error: null });
  });

  it("ne s'abonne pas pour une adresse privée", () => {
    const { result } = renderHook(() => useReviews('a1', false));
    expect(mocked.subscribeToReviews).not.toHaveBeenCalled();
    expect(result.current).toEqual({ reviews: [], loading: false, error: null });
  });
});
