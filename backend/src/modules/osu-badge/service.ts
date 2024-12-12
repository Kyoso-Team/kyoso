import * as v from 'valibot';
import { createServiceFnFromRepositoryQueryAndValidation } from '$src/utils/factories';
import { osuBadgeRepository } from './repository';
import { OsuBadgeValidation } from './validation';

const upsertOsuBadges = createServiceFnFromRepositoryQueryAndValidation(
  v.array(OsuBadgeValidation.UpsertOsuBadge),
  osuBadgeRepository.upsertOsuBadges,
  'osuBadge',
  'Failed to create or update osu! badges'
);

export const osuBadgeService = { upsertOsuBadges };
