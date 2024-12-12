import * as v from 'valibot';
import { tournamentTeamSettingsRepository } from './repository';
import { TournamentTeamSettingsValidation } from './validation';
import { createServiceFnFromRepositoryQueryAndValidation } from '$src/utils/factories';

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
