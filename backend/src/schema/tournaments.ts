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
    createdAt: timestamp(timestampConfig).notNull().defaultNow(),
    deletedAt: timestamp(timestampConfig),
    name: varchar({ length: 50 }).notNull(),
    description: varchar({ length: 150 }),
    urlSlug: varchar('url_slug', {
      length: 16
    }).notNull(),
    acronym: varchar('acronym', {
      length: 8
    }).notNull(),
    type: TournamentType().notNull(),
    rules: text(),
    bws: jsonb().$type<TournamentValidationOutput['Bws']>(),
    hostUserId: integer().references(() => User.id, { onDelete: 'set null' }),
    lowerRankRange: integer(),
    upperRankRange: integer(),
    minTeamSize: smallint(),
    maxTeamSize: smallint(),
    useTeamBanners: boolean().notNull().default(false)
  },
  (table) => [
    unique('tournament_name_uni').on(table.name),
    unique('tournament_url_slug_uni').on(table.urlSlug)
  ]
);

// All timers are in seconds
export const TournamentRefereeSettings = pgTable('tournament_referee_settings', {
  tournamentId: integer()
    .primaryKey()
    .references(() => Tournament.id, {
      onDelete: 'cascade'
    }),
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
  winCondition: WinCondition().notNull().default('score')
});

export const TournamentDates = pgTable('tournament_dates', {
  tournamentId: integer()
    .primaryKey()
    .references(() => Tournament.id, {
      onDelete: 'cascade'
    }),
  publishedAt: timestamp(timestampConfig),
  concludedAt: timestamp(timestampConfig),
  playerRegsOpenedAt: timestamp(timestampConfig),
  playerRegsClosedAt: timestamp(timestampConfig),
  staffRegsOpenedAt: timestamp(timestampConfig),
  staffRegsClosedAt: timestamp(timestampConfig)
});

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
