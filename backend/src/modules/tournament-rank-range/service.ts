// import { db } from '$src/singletons';
// import { Service } from '$src/utils/service';
// import { tournamentRankRangeRepository } from './repository';
// import { TournamentRankRangeValidation, type TournamentRankRangeValidationT } from './validation';
// import * as v from 'valibot';

// class TournamentRankRangeService extends Service {
//   public async createRankRange(input: v.InferInput<TournamentRankRangeValidationT['CreateRankRange']>) {
//     const fn = this.createServiceFunction('Failed to create tournament rank range');
//     const data = await fn.validate(TournamentRankRangeValidation.CreateRankRange, 'tournamentRankRange', input);
//     return await fn.handleDbQuery(
//       tournamentRankRangeRepository.createRankRange(db, data)
//     );
//   }

//   public async updateRankRange(input: v.InferInput<TournamentRankRangeValidationT['UpdateRankRange']>) {
//     const fn = this.createServiceFunction('Failed to update tournament rank range');
//     const data = await fn.validate(TournamentRankRangeValidation.UpdateRankRange, 'tournamentRankRange', input);
//     return await fn.handleDbQuery(
//       tournamentRankRangeRepository.updateRankRange(db, data)
//     );
//   }
// }

// export const tournamentRankRangeService = new TournamentRankRangeService();
