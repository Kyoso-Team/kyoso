import { and, eq, inArray, SQL, sql } from 'drizzle-orm';
import { OsuBadge, OsuUserAwardedBadge } from '$src/schema';
import { DbRepository } from '../_base/db-repository';
import type { DatabaseClient } from '$src/types';

class OsuBadgeDbRepository extends DbRepository {
  public getOsuUserAwardedBadges(db: DatabaseClient, osuUserId: number) {
    const query = db
      .select({
        badge: OsuBadge
      })
      .from(OsuUserAwardedBadge)
      .innerJoin(OsuBadge, eq(OsuBadge.id, OsuUserAwardedBadge.osuBadgeId))
      .where(eq(OsuUserAwardedBadge.osuUserId, osuUserId));

    return this.wrap({
      query,
      name: 'Get osu! user awarded badges',
      map: (rows) => rows.map((row) => row.badge)
    });
  }

  public upsertOsuBadges(
    db: DatabaseClient,
    badges: Pick<typeof OsuBadge.$inferInsert, 'imgFileName' | 'description'>[]
  ) {
    const query = db
      .insert(OsuBadge)
      .values(badges)
      .onConflictDoUpdate({
        target: OsuBadge.imgFileName,
        set: {
          description: sql`excluded.description`
        }
      });

    return this.wrap({
      query,
      name: 'Upsert osu! badges'
    });
  }

  public createOsuUserAwardedBadges(
    db: DatabaseClient,
    badges: (Pick<typeof OsuBadge.$inferInsert, 'imgFileName'> &
      Pick<typeof OsuUserAwardedBadge.$inferInsert, 'awardedAt'>)[],
    osuUserId: number
  ) {
    const sqlExpressions: SQL[] = badges.map(
      (badge) =>
        sql`when ${OsuBadge.imgFileName} = ${badge.imgFileName} then ${badge.awardedAt.toISOString()}::date`
    );
    const query = db
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

    return this.wrap({
      query,
      name: 'Create osu! user awarded badges'
    });
  }

  public deleteAllOsuUserAwardedBadges(db: DatabaseClient, osuUserId: number) {
    const query = db
      .delete(OsuUserAwardedBadge)
      .where(eq(OsuUserAwardedBadge.osuUserId, osuUserId));

    return this.wrap({
      query,
      name: 'Delete all osu! user awarded badges'
    });
  }
}

class OsuBadgeRepository {
  public db = new OsuBadgeDbRepository();
}

export const osuBadgeRepository = new OsuBadgeRepository();
