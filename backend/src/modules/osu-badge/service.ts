import * as v from 'valibot';
import { Service } from '$src/utils/service';
import { osuBadgeRepository } from './osu-badge.repository';
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

  public async handleOsuUserAwardedBadges(
    db: DatabaseClient,
    fetchedBadges: {
      description: string;
      imgFileName: string;
      awardedAt: Date;
    }[],
    osuUserId: number
  ) {
    const fn = this.createServiceFunction('Failed to handle osu! user awarded badges');

    const currentBadges = await osuBadgeRepository.getOsuUserAwardedBadges(db, osuUserId);

    const [fetchedBadgesSet, currentBadgesSet] = [
      new Set(fetchedBadges.map((badge) => badge.imgFileName)),
      new Set(currentBadges.map((badge) => badge.imgFileName))
    ];

    const addBadges = fetchedBadges.filter((badge) => !currentBadgesSet.has(badge.imgFileName));
    const removeBadges = currentBadges.filter((badge) => !fetchedBadgesSet.has(badge.imgFileName));

    if (addBadges.length !== 0) {
      await fn.handleDbQuery(
        osuBadgeRepository.createOsuUserAwardedBadges(db, addBadges, osuUserId)
      );
    }

    if (removeBadges.length !== 0) {
      const badgeIds = removeBadges.map((badge) => badge.id);

      await fn.handleDbQuery(
        osuBadgeRepository.removeOsuUserAwardedBadges(db, badgeIds, osuUserId)
      );
    }
  }
}

export const osuBadgeService = new OsuBadgeService();
