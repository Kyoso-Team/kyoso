import * as v from 'valibot';
import { tournamentRankRangeRepository } from './repository';
import { TournamentRankRangeValidation } from './validation';
import { createServiceFnFromRepositoryQuery } from '$src/utils/factories';

const createRankRange = createServiceFnFromRepositoryQuery(
  TournamentRankRangeValidation.CreateRankRange,
  tournamentRankRangeRepository.createRankRange,
  'tournamentRankRange',
  'Failed to create tournament rank range'
);

const updateRankRange = createServiceFnFromRepositoryQuery(
  TournamentRankRangeValidation.UpdateRankRange,
  tournamentRankRangeRepository.updateRankRange,
  'tournamentRankRange',
  'Failed to update tournament rank range'
);

export const tournamentRankRangeService = { createRankRange, updateRankRange };
