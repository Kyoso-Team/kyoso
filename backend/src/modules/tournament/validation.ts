import * as v from 'valibot';
import { TournamentType } from '$src/schema';
import * as s from '$src/utils/validation';
import type { MapInput, MapOutput } from '$src/types';

export abstract class TournamentValidation {
  public static Bws = v.record(
    v.union([v.literal('x'), v.literal('y'), v.literal('z')]),
    v.pipe(v.number(), v.notValue(0), v.minValue(-10), v.maxValue(10))
  );

  private static BaseCreateTournament = v.object({
    name: v.pipe(v.string(), v.minLength(2), v.maxLength(50)),
    urlSlug: v.pipe(v.string(), v.minLength(2), v.maxLength(16), s.validUrlSlug()),
    acronym: v.pipe(v.string(), v.minLength(2), v.maxLength(8)),
    type: v.picklist(TournamentType.enumValues),
    hostUserId: s.integerId(),
    rankRange: v.optional(
      v.pipe(
        v.object({
          lower: v.pipe(v.number(), v.integer(), v.minValue(1)),
          upper: v.nullable(v.pipe(v.number(), v.integer(), v.minValue(1)))
        }),
        v.check(
          (i) => !i.upper || (!!i.upper && i.lower <= i.upper),
          'Invalid rank range: Expected the upper rank range limit to be greater than the lower rank range limit'
        )
      )
    )
  });

  private static CreateSoloTournament = v.object({
    ...v.omit(this.BaseCreateTournament, ['type']).entries,
    type: v.literal(TournamentType.enumValues[0])
  });

  private static CreateTeamTournament = v.object({
    ...v.omit(this.BaseCreateTournament, ['type']).entries,
    type: v.union([
      v.literal(TournamentType.enumValues[1]),
      v.literal(TournamentType.enumValues[2])
    ]),
    teamSize: v.pipe(
      v.object({
        min: v.pipe(v.number(), v.integer(), v.minValue(2), v.maxValue(16)),
        max: v.pipe(v.number(), v.integer(), v.minValue(2), v.maxValue(16))
      }),
      v.check(
        (i) => i.min <= i.max,
        'Invalid team settings: Expected the max. team size to be greater than the min. team size'
      )
    ),
    useTeamBanners: v.optional(v.boolean())
  });

  public static CreateTournament = v.union([this.CreateSoloTournament, this.CreateTeamTournament]);

  public static CreateTournamentOmitHost = v.union([
    v.omit(this.CreateSoloTournament, ['hostUserId']),
    v.omit(this.CreateTeamTournament, ['hostUserId'])
  ]);

  public static UpdateTournament = v.union([
    v.partial(
      v.object({
        ...v.omit(this.CreateSoloTournament, ['hostUserId', 'type']).entries,
        bws: this.Bws
      })
    ),
    v.partial(
      v.object({
        ...v.omit(this.CreateTeamTournament, ['hostUserId', 'type']).entries,
        bws: this.Bws,
        useTeamBanners: v.boolean()
      })
    )
  ]);
}

export type TournamentValidationOutput = MapOutput<typeof TournamentValidation>;
export type TournamentValidationInput = MapInput<typeof TournamentValidation>;
