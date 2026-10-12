import type { Meta, StoryObj } from '@storybook/react';

import { makeReview } from '@/testing/fixtures';

import { ReviewItem } from './ReviewItem';

const meta = {
  title: 'Composants/ReviewItem',
  component: ReviewItem,
  args: { review: makeReview() },
} satisfies Meta<typeof ReviewItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextOnly: Story = {};

export const WithPhoto: Story = {
  args: {
    review: makeReview({
      id: 'review-2',
      rating: 5,
      photoURL: 'https://picsum.photos/seed/review/400/300',
      authorPhotoURL: 'https://picsum.photos/seed/bob/200/200',
    }),
  },
};
