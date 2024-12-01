import * as v from 'valibot';
import type { DatabaseClient } from '$src/types';
import type { TournamentTeamSettingsValidation } from './validation';
import { TournamentTeamSettings } from '$src/schema';
import { eq } from 'drizzle-orm';

async function createTeamSettings(db: DatabaseClient, teamSettings: v.InferOutput<typeof TournamentTeamSettingsValidation['CreateTeamSettings']>) {
  return db.insert(TournamentTeamSettings).values(teamSettings);
}

async function updateTeamSettings(db: DatabaseClient, teamSettings: v.InferOutput<typeof TournamentTeamSettingsValidation['UpdateTeamSettings']>, tournamentId: number) {
  return db.update(TournamentTeamSettings).set(teamSettings).where(eq(TournamentTeamSettings.tournamentId, tournamentId));
}

export const tournamentTeamSettingsRepository = { createTeamSettings, updateTeamSettings };
