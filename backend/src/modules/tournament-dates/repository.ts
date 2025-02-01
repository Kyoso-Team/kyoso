// import * as v from 'valibot';
// import { TournamentDates } from '$src/schema';
// import type { DatabaseClient } from '$src/types';
// import type { TournamentDatesValidation } from './validation';

// async function createTournamentDates(
//   db: DatabaseClient,
//   dates: v.InferOutput<(typeof TournamentDatesValidation)['CreateTournamentDates']>
// ) {
//   return db.insert(TournamentDates).values(dates);
// }

// async function updateTournamentDates(
//   db: DatabaseClient,
//   dates: v.InferOutput<(typeof TournamentDatesValidation)['UpdateTournamentDates']>
// ) {
//   return db.update(TournamentDates).set(dates);
// }

// export const tournamentDatesRepository = { createTournamentDates, updateTournamentDates };
