import type { Meta, StoryObj } from '@storybook/react';

import { EmptyState } from './EmptyState';

const meta = {
  title: 'Composants/EmptyState',
  component: EmptyState,
  args: { message: 'Aucune adresse pour le moment.' },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Reviews: Story = {
  args: { icon: 'chatbubbles-outline', message: 'Aucun avis pour le moment.' },
};
