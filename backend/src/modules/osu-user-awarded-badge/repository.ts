import { sql } from 'drizzle-orm';
import * as v from 'valibot';
import { OsuBadge, OsuUserAwardedBadge } from '$src/schema';
import type { DatabaseClient } from '$src/types';
import type { OsuUserAwardedBadgeValidation } from './validation';

async function createOsuUserAwardedBadges(
  db: DatabaseClient,
  badges: v.InferOutput<(typeof OsuUserAwardedBadgeValidation)['CreateOsuUserAwardedBadge']>[],
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

export const osuUserAwardedBadgeRepository = { createOsuUserAwardedBadges };
