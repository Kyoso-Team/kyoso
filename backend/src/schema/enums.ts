import { pgEnum } from 'drizzle-orm/pg-core';

export const TournamentType = pgEnum('tournament_type', ['solo', 'teams', 'draft']);

export const DraftOrderType = pgEnum('draft_order_type', ['linear', 'snake']);

export const WinCondition = pgEnum('win_condition', ['score', 'accuracy', 'combo']);
