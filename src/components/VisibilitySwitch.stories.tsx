import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { VisibilitySwitch } from './VisibilitySwitch';

const meta = {
  title: 'Composants/VisibilitySwitch',
  component: VisibilitySwitch,
  args: { isPublic: false, onChange: fn() },
} satisfies Meta<typeof VisibilitySwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Private: Story = {};

export const Public: Story = {
  args: { isPublic: true },
};

export const Interactive: Story = {
  render: function Render(args) {
    const [isPublic, setIsPublic] = useState(args.isPublic);
    return (
      <VisibilitySwitch
        {...args}
        isPublic={isPublic}
        onChange={(value) => {
          setIsPublic(value);
          args.onChange(value);
        }}
      />
    );
  },
};
