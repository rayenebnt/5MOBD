import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { ReviewForm } from './ReviewForm';

const meta = {
  title: 'Composants/ReviewForm',
  component: ReviewForm,
  args: { onSubmit: fn(async () => undefined) },
} satisfies Meta<typeof ReviewForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
