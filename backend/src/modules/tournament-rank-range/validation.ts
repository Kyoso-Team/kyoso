// import * as v from 'valibot';
// import * as s from '$src/utils/validation';

// export abstract class TournamentRankRangeValidation {
//   private static rankRangecheck = [
//     <T extends { lower: number; upper: number | null }>(input: T) =>
//       !input.upper || (!!input.upper && input.lower <= input.upper),
//     'Invalid rank range: Expected the upper rank range limit to be greater than the lower rank range limit'
//   ] as const;
  
//   public static CreateRankRange = v.pipe(
//     v.object({
//       tournamentId: s.integerId(),
//       lower: v.pipe(v.number(), v.integer(), v.minValue(1)),
//       upper: v.nullable(v.pipe(v.number(), v.integer(), v.minValue(1)))
//     }),
//     v.check(...this.rankRangecheck)
//   );
  
//   public static UpdateRankRange = v.pipe(
//     v.omit(this.CreateRankRange.pipe[0], ['tournamentId']),
//     v.check(...this.rankRangecheck)
//   );
// }

// export type TournamentRankRangeValidationT = typeof TournamentRankRangeValidation;
