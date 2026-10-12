import type { Meta, StoryObj } from '@storybook/react';

import { Avatar } from './Avatar';

const meta = {
  title: 'Composants/Avatar',
  component: Avatar,
  args: {
    name: 'Alice Martin',
    uri: null,
    size: 64,
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};

export const WithPhoto: Story = {
  args: { uri: 'https://picsum.photos/seed/avatar/200/200' },
};

export const Large: Story = {
  args: { size: 120 },
};
