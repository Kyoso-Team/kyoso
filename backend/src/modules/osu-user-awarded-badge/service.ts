import * as v from 'valibot';
import { createServiceFnFromRepositoryQueryAndValidation } from '$src/utils/factories';
import { osuUserAwardedBadgeRepository } from './repository';
import { OsuUserAwardedBadgeValidation } from './validation';

export const createOsuUserAwardedBadges = createServiceFnFromRepositoryQueryAndValidation(
  v.array(OsuUserAwardedBadgeValidation.CreateOsuUserAwardedBadge),
  osuUserAwardedBadgeRepository.createOsuUserAwardedBadges,
  'osuUserAwardedBadges',
  'Failed to create osu! user awarded badges'
);

export const osuUserAwardedBadgeService = { createOsuUserAwardedBadges };
