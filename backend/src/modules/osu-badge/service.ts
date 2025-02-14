import * as v from 'valibot';
import { Service } from '$src/utils/service';
import { osuBadgeRepository } from './repository';
import { OsuBadgeValidation } from './validation';
import type { DatabaseClient } from '$src/types';
import type { OsuBadgeValidationInput } from './validation';

class OsuBadgeService extends Service {
  public async upsertOsuBadges(
    db: DatabaseClient,
    badges: OsuBadgeValidationInput['UpsertOsuBadge'][]
  ) {
    const fn = this.createServiceFunction('Failed to create or update osu! badges');
    const validatedBadges = await fn.validate(
      v.array(OsuBadgeValidation.UpsertOsuBadge),
      'osuBadges',
      badges
    );
    return await fn.handleDbQuery(osuBadgeRepository.upsertOsuBadges(db, validatedBadges));
  }

  public async createOsuUserAwardedBadges(
    db: DatabaseClient,
    badges: OsuBadgeValidationInput['CreateOsuUserAwardedBadge'][],
    osuUserId: number
  ) {
    const fn = this.createServiceFunction('Failed to create osu! user awarded badges');
    const validatedBadges = await fn.validate(
      v.array(OsuBadgeValidation.CreateOsuUserAwardedBadge),
      'osuUserAwardedBadges',
      badges
    );
    return await fn.handleDbQuery(
      osuBadgeRepository.createOsuUserAwardedBadges(db, validatedBadges, osuUserId)
    );
  }
}

export const osuBadgeService = new OsuBadgeService();
