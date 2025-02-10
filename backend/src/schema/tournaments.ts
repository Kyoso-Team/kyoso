import {
  boolean,
  char,
  integer,
  jsonb,
  numeric,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  varchar
} from 'drizzle-orm/pg-core';
import { DraftOrderType, TournamentType, WinCondition } from './enums';
import { User } from './users';
import { timestampConfig } from './utils';
import type { TournamentValidationOutput } from '$src/modules/tournament/validation';

export const Tournament = pgTable(
  'tournament',
  {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    // Dates
    createdAt: timestamp(timestampConfig).notNull().defaultNow(),
    deletedAt: timestamp(timestampConfig),
    publishedAt: timestamp(timestampConfig),
    concludedAt: timestamp(timestampConfig),
    playerRegsOpenedAt: timestamp(timestampConfig),
    playerRegsClosedAt: timestamp(timestampConfig),
    staffRegsOpenedAt: timestamp(timestampConfig),
    staffRegsClosedAt: timestamp(timestampConfig),
    // Branding
    name: varchar({ length: 50 }).notNull(),
    description: varchar({ length: 150 }),
    urlSlug: varchar('url_slug', {
      length: 16
    }).notNull(),
    acronym: varchar('acronym', {
      length: 8
    }).notNull(),
    // Format and team settings
    type: TournamentType().notNull(),
    bws: jsonb().$type<TournamentValidationOutput['Bws']>(),
    lowerRankRange: integer(),
    upperRankRange: integer(),
    minTeamSize: smallint(),
    maxTeamSize: smallint(),
    useTeamBanners: boolean().notNull().default(false),
    // Referee settings (all timers are in seconds)
    rules: text(),
    pickTimerLength: smallint().notNull().default(120),
    banTimerLength: smallint().notNull().default(120),
    protectTimerLength: smallint().notNull().default(120),
    readyTimerLength: smallint().notNull().default(120),
    startTimerLength: smallint().notNull().default(10),
    allowDoublePick: boolean().notNull().default(false),
    allowDoubleBan: boolean().notNull().default(false),
    allowDoubleProtect: boolean().notNull().default(false),
    banOrder: DraftOrderType().notNull().default('linear'),
    pickOrder: DraftOrderType().notNull().default('linear'),
    protectOrder: DraftOrderType().notNull().default('linear'),
    forceNoFail: boolean().notNull().default(true),
    banAndProtectCancelOut: boolean().notNull().default(false),
    winCondition: WinCondition().notNull().default('score'),
    // Relations
    hostUserId: integer().references(() => User.id, { onDelete: 'set null' })
  },
  (table) => [
    unique('tournament_name_uni').on(table.name),
    unique('tournament_url_slug_uni').on(table.urlSlug)
  ]
);

export const TournamentDate = pgTable('tournament_date', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  label: varchar({ length: 50 }).notNull(),
  datetime: boolean().notNull(),
  from: timestamp(timestampConfig).notNull(),
  to: timestamp(timestampConfig),
  tournamentId: integer().references(() => Tournament.id, {
    onDelete: 'cascade'
  })
});

export const TournamentLink = pgTable('tournament_link', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  order: smallint().notNull(),
  label: varchar({ length: 50 }).notNull(),
  url: varchar({ length: 150 }).notNull(),
  icon: varchar({
    length: 25,
    enum: [
      'osu',
      'discord',
      'google_sheets',
      'google_forms',
      'google_docs',
      'twitch',
      'youtube',
      'x',
      'challonge',
      'liquipedia',
      'donation',
      'website'
    ]
  }).notNull(),
  tournamentId: integer().references(() => Tournament.id, {
    onDelete: 'cascade'
  })
});

export const ModMultiplier = pgTable('mod_multiplier', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  mods: char({ length: 2, enum: ['ez', 'hd', 'hr', 'fl', 'bl', 'sd', 'pf'] })
    .array()
    .notNull(),
  multiplierIfSuccess: numeric({ precision: 2, scale: 2 }).notNull(),
  multiplierIfFailed: numeric({ precision: 2, scale: 2 }).notNull(),
  tournamentId: integer().references(() => Tournament.id, {
    onDelete: 'cascade'
  })
});
