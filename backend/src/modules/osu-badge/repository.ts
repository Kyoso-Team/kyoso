import { sql } from 'drizzle-orm';
import { snakeCase } from 'scule';
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
    const sqlExpressions = badges
      .map(
        (badge) =>
          `when ${snakeCase(OsuBadge.imgFileName.name)} = '${badge.imgFileName}' then '${badge.awardedAt.toISOString()}'::date`
      )
      .join(' ');

    return db
      .insert(OsuUserAwardedBadge)
      .select(
        db
          .select({
            osuUserId: sql`${osuUserId}`.as('osu_user_id'),
            osuBadgeId: OsuBadge.id,
            awardedAt: sql.raw(`case ${sqlExpressions} end`).as('awarded_at')
          })
          .from(OsuBadge)
      )
      .onConflictDoNothing({
        target: [OsuUserAwardedBadge.osuUserId, OsuUserAwardedBadge.osuBadgeId]
      });
  }
}

export const osuBadgeRepository = new OsuBadgeRepository();
