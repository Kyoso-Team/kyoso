import * as v from 'valibot';
import { createServiceFnFromRepositoryQueryAndValidation } from '$src/utils/factories';
import { tournamentTeamSettingsRepository } from './repository';
import { TournamentTeamSettingsValidation } from './validation';

const createTeamSettings = createServiceFnFromRepositoryQueryAndValidation(
  TournamentTeamSettingsValidation.CreateTeamSettings,
  tournamentTeamSettingsRepository.createTeamSettings,
  'teamSettings',
  'Failed to create tournament team settings'
);

const updateTeamSettings = createServiceFnFromRepositoryQueryAndValidation(
  TournamentTeamSettingsValidation.UpdateTeamSettings,
  tournamentTeamSettingsRepository.updateTeamSettings,
  'teamSettings',
  'Failed to update tournament team settings'
);

export const tournamentTeamSettingsService = { createTeamSettings, updateTeamSettings };
