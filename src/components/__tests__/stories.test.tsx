/**
 * Chaque story Storybook est rendue dans Jest (portable stories) :
 * on vérifie ainsi que toutes les stories restent valides.
 */
import { composeStories } from '@storybook/react';
import { render } from '@testing-library/react-native';
import type { ComponentType } from 'react';

import * as AddressCardStories from '../AddressCard.stories';
import * as AvatarStories from '../Avatar.stories';
import * as ButtonStories from '../Button.stories';
import * as EmptyStateStories from '../EmptyState.stories';
import * as PhotoPickerStories from '../PhotoPicker.stories';
import * as PrivacyBadgeStories from '../PrivacyBadge.stories';
import * as RatingStarsStories from '../RatingStars.stories';
import * as ReviewFormStories from '../ReviewForm.stories';
import * as ReviewItemStories from '../ReviewItem.stories';
import * as TextFieldStories from '../TextField.stories';
import * as VisibilitySwitchStories from '../VisibilitySwitch.stories';

// `storybook/test` cible le DOM (navigateur) : on remplace `fn` par un mock Jest
jest.mock('storybook/test', () => ({
  fn: (implementation?: (...args: unknown[]) => unknown) => jest.fn(implementation),
}));

const storyFiles = {
  AddressCard: AddressCardStories,
  Avatar: AvatarStories,
  Button: ButtonStories,
  EmptyState: EmptyStateStories,
  PhotoPicker: PhotoPickerStories,
  PrivacyBadge: PrivacyBadgeStories,
  RatingStars: RatingStarsStories,
  ReviewForm: ReviewFormStories,
  ReviewItem: ReviewItemStories,
  TextField: TextFieldStories,
  VisibilitySwitch: VisibilitySwitchStories,
};

describe.each(Object.entries(storyFiles))('Stories %s', (_name, stories) => {
  const composed = Object.entries(composeStories(stories)) as [string, ComponentType][];

  it('contient au moins une story', () => {
    expect(composed.length).toBeGreaterThan(0);
  });

  it.each(composed)('rend la story %s', (_storyName, Story) => {
    const { toJSON } = render(<Story />);
    expect(toJSON()).toBeTruthy();
  });
});
