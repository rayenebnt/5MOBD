import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { Button } from './Button';

const meta = {
  title: 'Composants/Button',
  component: Button,
  args: {
    title: 'Enregistrer',
    onPress: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary', title: 'Galerie', icon: 'images-outline' },
};

export const Danger: Story = {
  args: { variant: 'danger', title: 'Supprimer', icon: 'trash-outline' },
};

export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
