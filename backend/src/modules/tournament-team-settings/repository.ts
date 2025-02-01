// import { eq } from 'drizzle-orm';
// import * as v from 'valibot';
// import { TournamentTeamSettings } from '$src/schema';
// import type { DatabaseClient } from '$src/types';
// import type { TournamentTeamSettingsValidationT } from './validation';

// class TournamentTeamSettingsRepository {
//   public async createTeamSettings(
//     db: DatabaseClient,
//     teamSettings: v.InferOutput<TournamentTeamSettingsValidationT['CreateTeamSettings']>
//   ) {
//     return db.insert(TournamentTeamSettings).values(teamSettings);
//   }

//   public async updateTeamSettings(
//     db: DatabaseClient,
//     teamSettings: v.InferOutput<TournamentTeamSettingsValidationT['UpdateTeamSettings']>,
//     tournamentId: number
//   ) {
//     return db
//       .update(TournamentTeamSettings)
//       .set(teamSettings)
//       .where(eq(TournamentTeamSettings.tournamentId, tournamentId));
//   }
// }

// export const tournamentTeamSettingsRepository = new TournamentTeamSettingsRepository();
