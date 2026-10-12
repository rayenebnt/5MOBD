import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { makeAddress } from '@/testing/fixtures';

import { AddressCard } from './AddressCard';

const meta = {
  title: 'Composants/AddressCard',
  component: AddressCard,
  args: {
    address: makeAddress(),
    onPress: fn(),
  },
} satisfies Meta<typeof AddressCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MyPublicAddress: Story = {};

export const MyPrivateAddress: Story = {
  args: { address: makeAddress({ id: 'address-2', isPublic: false, name: 'Chez mes parents' }) },
};

export const OtherUserAddress: Story = {
  args: {
    showOwner: true,
    address: makeAddress({ id: 'address-3', ownerId: 'user-2', ownerName: 'Bob Durand' }),
  },
};

export const WithoutPhoto: Story = {
  args: { address: makeAddress({ id: 'address-4', photoURL: null, description: '' }) },
};
