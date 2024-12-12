import { sql } from 'drizzle-orm';
import * as v from 'valibot';
import { OsuBadge } from '$src/schema';
import type { DatabaseClient } from '$src/types';
import type { OsuBadgeValidation } from './validation';

async function upsertOsuBadges(
  db: DatabaseClient,
  badges: v.InferOutput<(typeof OsuBadgeValidation)['UpsertOsuBadge']>[]
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

export const osuBadgeRepository = { upsertOsuBadges };
