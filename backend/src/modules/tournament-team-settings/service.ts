import * as v from 'valibot';
import { tournamentTeamSettingsRepository } from './repository';
import { TournamentTeamSettingsValidation } from './validation';
import { createServiceFnFromRepositoryQuery } from '$src/utils/factories';

const createTeamSettings = createServiceFnFromRepositoryQuery(
  TournamentTeamSettingsValidation.CreateTeamSettings,
  tournamentTeamSettingsRepository.createTeamSettings,
  'teamSettings',
  'Failed to create tournament team settings'
);

const updateTeamSettings = createServiceFnFromRepositoryQuery(
  TournamentTeamSettingsValidation.UpdateTeamSettings,
  tournamentTeamSettingsRepository.updateTeamSettings,
  'teamSettings',
  'Failed to update tournament team settings'
);

export const tournamentTeamSettingsService = { createTeamSettings, updateTeamSettings };
