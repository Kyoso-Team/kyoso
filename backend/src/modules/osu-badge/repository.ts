import { sql } from 'drizzle-orm';
import { OsuBadge, OsuUserAwardedBadge } from '$src/schema';
import type { DatabaseClient } from '$src/types';
import type { OsuBadgeValidationOutput } from './validation';

class OsuBadgeRepository {
  public async upsertOsuBadges(
    db: DatabaseClient,
    badges: OsuBadgeValidationOutput['UpsertOsuBadge'][]
  ) {
    return db
      .insert(OsuBadge)
      .values(badges)
      .onConflictDoUpdate({
        target: OsuBadge.imgFileName,
        set: {
          description: sql`excluded.description`
        }
      });
  }
  
  public async createOsuUserAwardedBadges(
    db: DatabaseClient,
    badges: OsuBadgeValidationOutput['CreateOsuUserAwardedBadge'][],
    osuUserId: number
  ) {
    return db
      .insert(OsuUserAwardedBadge)
      .select(
        db
          .select({
            awardedAt: sql`case ${badges
              .map(
                (badge) =>
                  sql`when ${OsuBadge.imgFileName} = ${badge.imgFileName} then ${badge.awardedAt}`
              )
              .join(' ')} end`.as('awarded_at'),
            osuBadgeId: OsuBadge.id,
            osuUserId: sql`${osuUserId}`.as('osu_user_id')
          })
          .from(OsuBadge)
      )
      .onConflictDoNothing({
        target: [OsuUserAwardedBadge.osuUserId, OsuUserAwardedBadge.osuBadgeId]
      });
  }
}

export const osuBadgeRepository = new OsuBadgeRepository();
