// import * as v from 'valibot';
// import * as s from '$src/utils/validation';

// export abstract class TournamentTeamSettingsValidation {
//   private static teamSettingsCheck = [
//     <T extends { minTeamSize: number; maxTeamSize: number }>(input: T) =>
//       input.minTeamSize <= input.maxTeamSize,
//     'Invalid team settings: Expected the max. team size to be greater than the min. team size'
//   ] as const;

//   public static CreateTeamSettings = v.pipe(
//     v.object({
//       tournamentId: s.integerId(),
//       minTeamSize: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(16)),
//       maxTeamSize: v.pipe(v.number(), v.integer(), v.minValue(2), v.maxValue(16)),
//       useTeamBanners: v.boolean()
//     }),
//     v.check(...this.teamSettingsCheck)
//   );

//   public static UpdateTeamSettings = v.pipe(
//     v.omit(this.CreateTeamSettings.pipe[0], ['tournamentId']),
//     v.check(...this.teamSettingsCheck)
//   );
// }

// export type TournamentTeamSettingsValidationT = typeof TournamentTeamSettingsValidation;
