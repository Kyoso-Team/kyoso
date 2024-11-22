import * as v from 'valibot';
import { osuBadgeRepository } from './repository';
import { OsuBadgeValidation } from './validation';
import { createServiceFnFromRepositoryQuery } from '$src/utils/factories';

const upsertOsuBadges = createServiceFnFromRepositoryQuery(
  v.array(OsuBadgeValidation.UpsertOsuBadge),
  osuBadgeRepository.upsertOsuBadges,
  'osuBadge',
  'Failed to create or update osu! badges'
);

export const osuBadgeService = { upsertOsuBadges };
