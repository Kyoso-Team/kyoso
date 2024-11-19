import { OsuBadge } from '$src/schema';
import type { DatabaseClient } from '$src/types';
import { sql } from 'drizzle-orm';
import type { OsuBadgeValidationOutput } from './validation';

async function upsertOsuBadges(db: DatabaseClient, badges: OsuBadgeValidationOutput['CreateOsuBadge'][]) {
  return db.insert(OsuBadge).values(badges).onConflictDoUpdate({
    target: OsuBadge.imgFileName,
    set: {
      description: sql`excluded.description`
    }
  });
}



export const osuBadgeRepository = { upsertOsuBadges };