import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { PhotoPicker } from './PhotoPicker';

const meta = {
  title: 'Composants/PhotoPicker',
  component: PhotoPicker,
  args: { label: 'Photo', uri: null, onChange: fn() },
} satisfies Meta<typeof PhotoPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithPhoto: Story = {
  args: { uri: 'https://picsum.photos/seed/photo/400/300' },
};

export const Interactive: Story = {
  render: function Render(args) {
    const [uri, setUri] = useState(args.uri);
    return (
      <PhotoPicker
        {...args}
        uri={uri}
        onChange={(next) => {
          setUri(next);
          args.onChange(next);
        }}
      />
    );
  },
};
