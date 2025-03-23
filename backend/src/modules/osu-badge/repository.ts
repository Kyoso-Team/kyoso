import { and, eq, inArray, SQL, sql } from 'drizzle-orm';
import { OsuBadge, OsuUserAwardedBadge } from '$src/schema';
import type { DatabaseClient } from '$src/types';
import type { OsuBadgeValidationOutput } from './validation';

class OsuBadgeRepository {
  public async getOsuUserAwardedBadges(db: DatabaseClient, osuUserId: number) {
    return db
      .select({
        badge: OsuBadge
      })
      .from(OsuUserAwardedBadge)
      .innerJoin(OsuBadge, eq(OsuBadge.id, OsuUserAwardedBadge.osuBadgeId))
      .where(eq(OsuUserAwardedBadge.osuUserId, osuUserId))
      .then((rows) => rows.map((row) => row.badge));
  }

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
    const sqlExpressions: SQL[] = badges.map(
      (badge) =>
        sql`when ${OsuBadge.imgFileName} = ${badge.imgFileName} then ${badge.awardedAt.toISOString()}::date`
    );

    return db
      .insert(OsuUserAwardedBadge)
      .select(
        db
          .select({
            osuUserId: sql`${osuUserId}`.as('osu_user_id'),
            osuBadgeId: OsuBadge.id,
            awardedAt: sql`case ${sql.join(sqlExpressions, sql` `)} end`.as('awarded_at')
          })
          .from(OsuBadge)
          .where(
            inArray(
              OsuBadge.imgFileName,
              badges.map((badge) => badge.imgFileName)
            )
          )
      )
      .onConflictDoNothing({
        target: [OsuUserAwardedBadge.osuUserId, OsuUserAwardedBadge.osuBadgeId]
      });
  }

  public async removeOsuUserAwardedBadges(
    db: DatabaseClient,
    badgeIds: number[],
    osuUserId: number
  ) {
    return db
      .delete(OsuUserAwardedBadge)
      .where(
        and(
          eq(OsuUserAwardedBadge.osuUserId, osuUserId),
          inArray(OsuUserAwardedBadge.osuBadgeId, badgeIds)
        )
      );
  }
}

export const osuBadgeRepository = new OsuBadgeRepository();
