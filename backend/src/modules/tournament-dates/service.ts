import * as v from 'valibot';
import { tournamentDatesRepository } from './repository';
import { TournamentDatesValidation } from './validation';
import { createServiceFnFromRepositoryQueryAndValidation } from '$src/utils/factories';

const createTournamentDates = createServiceFnFromRepositoryQueryAndValidation(
  TournamentDatesValidation.CreateTournamentDates,
  tournamentDatesRepository.createTournamentDates,
  'tournamentDates',
  'Failed to create tournament dates'
);

const updateTournamentDates = createServiceFnFromRepositoryQueryAndValidation(
  TournamentDatesValidation.UpdateTournamentDates,
  tournamentDatesRepository.updateTournamentDates,
  'tournamentDates',
  'Failed to update tournament dates'
);

export const tournamentDatesService = { createTournamentDates, updateTournamentDates };
