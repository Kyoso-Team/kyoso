import * as v from 'valibot';
import { osuUserAwardedBadgeRepository } from './repository';
import { OsuUserAwardedBadgeValidation } from './validation';
import { createServiceFnFromRepositoryQuery } from '$src/utils/factories';

export const createOsuUserAwardedBadges = createServiceFnFromRepositoryQuery(
  v.array(OsuUserAwardedBadgeValidation.CreateOsuUserAwardedBadge),
  osuUserAwardedBadgeRepository.createOsuUserAwardedBadges,
  'osuUserAwardedBadges',
  'Failed to create osu! user awarded badges'
);

export const osuUserAwardedBadgeService = { createOsuUserAwardedBadges };
