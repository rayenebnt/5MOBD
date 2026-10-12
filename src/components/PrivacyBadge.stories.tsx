import type { Meta, StoryObj } from '@storybook/react';

import { PrivacyBadge } from './PrivacyBadge';

const meta = {
  title: 'Composants/PrivacyBadge',
  component: PrivacyBadge,
  args: { isPublic: true },
} satisfies Meta<typeof PrivacyBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Public: Story = {};

export const Private: Story = {
  args: { isPublic: false },
};
