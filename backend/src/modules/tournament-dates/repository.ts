import * as v from 'valibot';
import type { DatabaseClient } from '$src/types';
import type { TournamentDatesValidation } from './validation';
import { TournamentDates } from '$src/schema';

async function createTournamentDates(db: DatabaseClient, dates: v.InferOutput<typeof TournamentDatesValidation['CreateTournamentDates']>) {
  return db.insert(TournamentDates).values(dates);
}

async function updateTournamentDates(db: DatabaseClient, dates: v.InferOutput<typeof TournamentDatesValidation['UpdateTournamentDates']>) {
  return db.update(TournamentDates).set(dates);
}

export const tournamentDatesRepository = { createTournamentDates, updateTournamentDates };
