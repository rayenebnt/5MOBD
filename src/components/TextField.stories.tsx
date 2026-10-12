import type { Meta, StoryObj } from '@storybook/react';

import { TextField } from './TextField';

const meta = {
  title: 'Composants/TextField',
  component: TextField,
  args: {
    label: 'Nom',
    placeholder: 'Ex. : Le petit bistrot',
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: 'Le Petit Bistrot' },
};

export const WithError: Story = {
  args: { value: '', error: 'Le nom est obligatoire.' },
};

export const Multiline: Story = {
  args: { label: 'Description', multiline: true, placeholder: 'Pourquoi est-ce une bonne adresse ?' },
};
