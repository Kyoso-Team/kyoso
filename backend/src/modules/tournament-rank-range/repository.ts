import * as v from 'valibot';
import type { DatabaseClient } from '$src/types';
import type { TournamentRankRangeValidation } from './validation';
import { TournamentRankRange } from '$src/schema';

async function createRankRange(db: DatabaseClient, rankRange: v.InferOutput<typeof TournamentRankRangeValidation['CreateRankRange']>) {
  return db.insert(TournamentRankRange).values(rankRange);
}

async function updateRankRange(db: DatabaseClient, rankRange: v.InferOutput<typeof TournamentRankRangeValidation['UpdateRankRange']>) {
  return db.update(TournamentRankRange).set(rankRange);
}

export const tournamentRankRangeRepository = { createRankRange, updateRankRange };
