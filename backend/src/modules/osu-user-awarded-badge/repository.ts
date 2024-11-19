import { OsuBadge, OsuUserAwardedBadge } from '$src/schema';
import type { DatabaseClient } from '$src/types';
import { sql } from 'drizzle-orm';
import type { OsuUserAwardedBadgeValidationOutput } from './validations';

async function createOsuUserAwardedBadge(
  db: DatabaseClient,
  osuUserId: number,
  badges: OsuUserAwardedBadgeValidationOutput['CreateOsuUserAwardedBadge'][]
) {
  return db
    .insert(OsuUserAwardedBadge)
    .select(
      db.select({
        awardedAt: sql`case ${
          badges.map((badge) => sql`when ${OsuBadge.imgFileName} = ${badge.imgFileName} then ${badge.awardedAt}`).join(' ')
        } end`.as('awarded_at'),
        osuBadgeId: OsuBadge.id,
        osuUserId: sql`${osuUserId}`.as('osu_user_id')
      }).from(OsuBadge)
    )
    .onConflictDoNothing({
      target: [OsuUserAwardedBadge.osuUserId, OsuUserAwardedBadge.osuBadgeId]
    });
}

export const osuUserAwardedBadgeRepository = { createOsuUserAwardedBadge };