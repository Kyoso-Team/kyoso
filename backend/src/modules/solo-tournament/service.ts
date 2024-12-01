import { db } from '$src/singletons';
import * as v from 'valibot';
import { tournamentService } from '../tournament/service';
import type { TournamentValidation } from '../tournament/validation';
import type { TournamentRankRangeValidation } from '../tournament-rank-range/validation';
import { tournamentRankRangeService } from '../tournament-rank-range/service';
import { tournamentDatesRepository } from '../tournament-dates/repository';

async function createTournament(tournament: v.InferOutput<typeof TournamentValidation['CreateSoloTournament']>, rankRange?: Omit<v.InferOutput<typeof TournamentRankRangeValidation['CreateRankRange']>, 'tournamentId'>) {
  await db.transaction(async (tx) => {
    const created = await tournamentService.createSoloTournament(tx, tournament);
    await tournamentDatesRepository.createTournamentDates(tx, { tournamentId: created.id });

    if (rankRange) {
      await tournamentRankRangeService.createRankRange(tx, { ...rankRange, tournamentId: created.id });
    }
  }).catch(tournamentService.handleTournamentCreationError(tournament, 'Failed to create tournament'));
}

export const soloTournamentService = { createTournament };
