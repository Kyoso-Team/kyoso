// import type { DatabaseClient } from '$src/types';
// import { Service } from '$src/utils/service';
// import { tournamentTeamSettingsRepository } from './repository';
// import { TournamentTeamSettingsValidation } from './validation';

// class TournamentTeamSettingsService extends Service {
//   public createTeamSettings = new ServiceFactory(
//     tournamentTeamSettingsRepository.createTeamSettings,
//     'Failed to create tournament team settings'
//   ).createWithValidation(
//     TournamentTeamSettingsValidation.CreateTeamSettings,
//     'teamSettings'
//   );

//   public updateTeamSettings = new ServiceFactory(
//     tournamentTeamSettingsRepository.updateTeamSettings,
//     'Failed to update tournament team settings'
//   ).createWithValidation(
//     TournamentTeamSettingsValidation.UpdateTeamSettings,
//     'teamSettings'
//   );
// }

// export const tournamentTeamSettingsService = new TournamentTeamSettingsService();
