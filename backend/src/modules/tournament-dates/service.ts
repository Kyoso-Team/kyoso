import * as v from 'valibot';
import { tournamentDatesRepository } from './repository';
import { TournamentDatesValidation } from './validation';
import { createServiceFnFromRepositoryQuery } from '$src/utils/factories';

const createTournamentDates = createServiceFnFromRepositoryQuery(
  TournamentDatesValidation.CreateTournamentDates,
  tournamentDatesRepository.createTournamentDates,
  'tournamentDates',
  'Failed to create tournament dates'
);

const updateTournamentDates = createServiceFnFromRepositoryQuery(
  TournamentDatesValidation.UpdateTournamentDates,
  tournamentDatesRepository.updateTournamentDates,
  'tournamentDates',
  'Failed to update tournament dates'
);

export const tournamentDatesService = { createTournamentDates, updateTournamentDates };
