import * as v from 'valibot';
import * as s from '$src/utils/validation';

const rankRangecheck = [
  <T extends { lower: number; upper: number | null }>(input: T) => !input.upper || (!!input.upper && input.lower <= input.upper),
  'Invalid rank range: Expected the upper rank range limit to be greater than the lower rank range limit'
] as const;

const CreateRankRange = v.pipe(
  v.object({
    tournamentId: s.integerId(),
    lower: v.pipe(v.number(), v.integer(), v.minValue(1)),
    upper: v.nullable(v.pipe(v.number(), v.integer(), v.minValue(1)))
  }),
  v.check(...rankRangecheck)
);

const UpdateRankRange = v.pipe(
  v.omit(CreateRankRange.pipe[0], ['tournamentId']),
  v.check(...rankRangecheck)
);

export const TournamentRankRangeValidation = {
  CreateRankRange,
  UpdateRankRange
};
