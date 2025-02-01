// import * as v from 'valibot';
// import { TournamentRankRange } from '$src/schema';
// import type { DatabaseClient } from '$src/types';
// import type { TournamentRankRangeValidationT } from './validation';

// class TournamentRankRangeRepository {
//   public async createRankRange(
//     db: DatabaseClient,
//     rankRange: v.InferOutput<TournamentRankRangeValidationT['CreateRankRange']>
//   ) {
//     return db.insert(TournamentRankRange).values(rankRange);
//   }

//   public async updateRankRange(
//     db: DatabaseClient,
//     rankRange: v.InferOutput<TournamentRankRangeValidationT['UpdateRankRange']>
//   ) {
//     return db.update(TournamentRankRange).set(rankRange);
//   }
// }

// export const tournamentRankRangeRepository = new TournamentRankRangeRepository();
