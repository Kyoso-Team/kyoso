import {
  bigint,
  boolean,
  char,
  inet,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  varchar
} from 'drizzle-orm/pg-core';
import { timestampConfig } from './utils';
import type * as v from 'valibot';
import type { AuthenticationValidationT } from '$src/modules/authentication/validation';

export const User = pgTable('user', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  registeredAt: timestamp(timestampConfig).notNull().defaultNow(),
  admin: boolean().notNull().default(false),
  approvedHost: boolean().notNull().default(false),
  banned: boolean().notNull().default(false)
});

export const UserApiKey = pgTable('user_api_key', {
  key: text().primaryKey(),
  createdAt: timestamp(timestampConfig).notNull().defaultNow(),
  userId: integer()
    .notNull()
    .references(() => User.id, {
      onDelete: 'cascade'
    })
});

export const OsuUser = pgTable(
  'osu_user',
  {
    userId: integer()
      .primaryKey()
      .references(() => User.id, {
        onDelete: 'cascade'
      }),
    updatedAt: timestamp(timestampConfig).notNull().defaultNow(),
    osuUserId: integer().notNull(),
    username: varchar({ length: 15 }).notNull(),
    restricted: boolean().notNull(),
    globalStdRank: integer(),
    globalTaikoRank: integer(),
    globalCatchRank: integer(),
    globalManiaRank: integer(),
    token: jsonb().notNull().$type<v.InferOutput<AuthenticationValidationT['OAuthToken']>>(),
    countryCode: char('country_code', {
      length: 2
    })
      .notNull()
      .references(() => Country.code)
  },
  (table) => [unique('osu_user_osu_user_id_uni').on(table.osuUserId)]
);

export const Country = pgTable('country', {
  code: char({
    length: 2
  }).primaryKey(),
  name: varchar({
    length: 35
  }).notNull()
});

export const OsuBadge = pgTable(
  'osu_badge',
  {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    /** Example: In URL `https://assets.ppy.sh/profile-badges/owc2023-winner.png`, `owc2023-winner.png` is the file name */
    imgFileName: text().notNull(),
    description: text()
  },
  (table) => [unique('osu_badge_img_file_name_uni').on(table.imgFileName)]
);

export const OsuUserAwardedBadge = pgTable(
  'osu_user_awarded_badge',
  {
    osuUserId: integer()
      .notNull()
      .references(() => OsuUser.osuUserId),
    osuBadgeId: integer()
      .notNull()
      .references(() => OsuBadge.id),
    awardedAt: timestamp(timestampConfig).notNull()
  },
  (table) => [
    primaryKey({
      columns: [table.osuUserId, table.osuBadgeId]
    })
  ]
);

export const DiscordUser = pgTable('discord_user', {
  userId: integer()
    .primaryKey()
    .references(() => User.id, {
      onDelete: 'cascade'
    }),
  updatedAt: timestamp(timestampConfig).notNull().defaultNow(),
  discordUserId: bigint({ mode: 'bigint' }).notNull(),
  username: varchar({ length: 32 }).notNull(),
  token: jsonb().notNull().$type<v.InferOutput<AuthenticationValidationT['OAuthToken']>>()
});

export const Session = pgTable('session', {
  id: text().primaryKey(),
  createdAt: timestamp(timestampConfig).notNull().defaultNow(),
  lastActiveAt: timestamp(timestampConfig).notNull().defaultNow(),
  expiresAt: timestamp(timestampConfig).notNull(),
  ipAddress: inet().notNull(),
  ipMetadata: jsonb().notNull().$type<
    Partial<{
      city: string;
      region: string;
      country: string;
    }>
  >(),
  userAgent: text(),
  userId: integer()
    .notNull()
    .references(() => User.id, {
      onDelete: 'cascade'
    })
});
