import * as v from 'valibot';
import type { DatabaseClient } from '$src/types';
import type { DiscordUserValidation } from './validation';
import { DiscordUser } from '$src/schema';
import { eq, sql } from 'drizzle-orm';

async function createDiscordUser(db: DatabaseClient, user: v.InferOutput<typeof DiscordUserValidation['CreateDiscordUser']>) {
  return db.insert(DiscordUser).values(user);
}

async function updateDiscordUser(db: DatabaseClient, user: v.InferOutput<typeof DiscordUserValidation['UpdateDiscordUser']>, discordUserId: bigint) {
  return db.update(DiscordUser).set({
    updatedAt: sql`now()`,
    ...user
  }).where(eq(DiscordUser.discordUserId, discordUserId));
}

export const discordUserRepository = { createDiscordUser, updateDiscordUser };
