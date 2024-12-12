import * as v from 'valibot';
import { osuUserAwardedBadgeRepository } from './repository';
import { OsuUserAwardedBadgeValidation } from './validation';
import { createServiceFnFromRepositoryQueryAndValidation } from '$src/utils/factories';

export const createOsuUserAwardedBadges = createServiceFnFromRepositoryQueryAndValidation(
  v.array(OsuUserAwardedBadgeValidation.CreateOsuUserAwardedBadge),
  osuUserAwardedBadgeRepository.createOsuUserAwardedBadges,
  'osuUserAwardedBadges',
  'Failed to create osu! user awarded badges'
);

export const osuUserAwardedBadgeService = { createOsuUserAwardedBadges };
