import * as v from 'valibot';
import { createServiceFnFromRepositoryQueryAndValidation } from '$src/utils/factories';
import { tournamentRankRangeRepository } from './repository';
import { TournamentRankRangeValidation } from './validation';

const createRankRange = createServiceFnFromRepositoryQueryAndValidation(
  TournamentRankRangeValidation.CreateRankRange,
  tournamentRankRangeRepository.createRankRange,
  'tournamentRankRange',
  'Failed to create tournament rank range'
);

const updateRankRange = createServiceFnFromRepositoryQueryAndValidation(
  TournamentRankRangeValidation.UpdateRankRange,
  tournamentRankRangeRepository.updateRankRange,
  'tournamentRankRange',
  'Failed to update tournament rank range'
);

export const tournamentRankRangeService = { createRankRange, updateRankRange };
