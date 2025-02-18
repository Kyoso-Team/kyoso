import { pgEnum } from 'drizzle-orm/pg-core';

export const TournamentType = pgEnum('tournament_type', ['solo', 'teams', 'draft']);

export const DraftOrderType = pgEnum('draft_order_type', ['linear', 'snake']);

export const WinCondition = pgEnum('win_condition', ['score', 'accuracy', 'combo']);

export const StaffPermission = pgEnum('staff_permission', [
  // Prefixes:
  // View: Get data
  // Create: Create data
  // Delete: Delete data
  // Manage: Create, update and delete data

  // Manage some (but not all) tournament settings. Can also manage staff members and roles
  'manage_tournament',
  // Tournament assets (upload and delete banner and logo)
  'manage_assets',
  // Custom tournament theme
  'manage_theme',
  // Player regs.
  'manage_regs',
  // Mappool structure,
  'manage_pool_structure',
  // Suggest maps
  'view_pool_suggestions',
  'create_pool_suggestions',
  'delete_pool_suggestions',
  // Pool maps,
  'view_pooled_maps',
  'manage_pooled_maps',
  // Playtest
  'view_feedback',
  'can_playtest',
  'can_submit_replays',
  // Matches
  'view_matches',
  'manage_matches',
  'ref_matches',
  'commentate_matches',
  'stream_matches',
  // Stats
  'manage_stats',
  // Misc.
  'can_play' // Can play in the tournament
]);
