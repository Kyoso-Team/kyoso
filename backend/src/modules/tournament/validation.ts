import * as v from 'valibot';
import { DraftOrderType, Tournament, TournamentType, WinCondition } from '$src/schema';
import * as s from '$src/utils/validation';
import type { InferInsertModel } from 'drizzle-orm';
import type { MapInput, MapOutput } from '$src/types';

export abstract class TournamentValidation {
  private static errMsg1 =
    "Invalid team settings: Can't set team settings for a solo tournament" as const;
  private static errMsg2 =
    'Invalid team settings: Must set team settings for a team-based tournament' as const;

  public static Bws = v.record(
    v.union([v.literal('x'), v.literal('y'), v.literal('z')]),
    v.pipe(v.number(), v.notValue(0), v.minValue(-10), v.maxValue(10))
  );

  private static BaseMutateTournament = v.object({
    name: v.pipe(v.string(), v.minLength(2), v.maxLength(50)),
    urlSlug: v.pipe(v.string(), v.minLength(2), v.maxLength(16), s.validUrlSlug()),
    acronym: v.pipe(v.string(), v.minLength(2), v.maxLength(8)),
    description: v.optional(v.string()),
    rankRange: v.optional(
      v.nullable(
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
    ),
    teamSize: v.optional(
      v.nullable(
        v.pipe(
          v.object({
            min: v.pipe(v.number(), v.integer(), v.minValue(2), v.maxValue(16)),
            max: v.pipe(v.number(), v.integer(), v.minValue(2), v.maxValue(16))
          }),
          v.check(
            (i) => i.min <= i.max,
            'Invalid team settings: Expected the max. team size to be greater than the min. team size'
          )
        )
      )
    )
  });

  public static CreateTournament = v.pipe(
    v.object({
      ...this.BaseMutateTournament.entries,
      isOpenRank: v.boolean(),
      type: v.picklist(TournamentType.enumValues),
      hostUserId: s.integerId()
    }),
    v.check((i) => {
      if (i.isOpenRank) {
        return !i.rankRange || Object.values(i.rankRange).every((val) => val === null);
      }
      return true;
    }, 'Cannot set rank range for an open rank tournament'),
    v.check((i) => {
      if (i.type === 'solo') {
        return i.teamSize === undefined;
      }
      return true;
    }, this.errMsg1),
    v.check((i) => {
      if (i.type !== 'solo') {
        return i.teamSize !== undefined && i.teamSize !== null;
      }
      return true;
    }, this.errMsg2),
    v.transform((i) => {
      return {
        ...i,
        upperRankRange: i.rankRange?.upper,
        lowerRankRange: i.rankRange?.lower,
        minTeamSize: i.teamSize?.min,
        maxTeamSize: i.teamSize?.max
      } as InferInsertModel<typeof Tournament>;
    })
  );

  public static UpdateTournamentRefereeSettings = v.partial(
    v.object({
      timers: v.record(
        v.union([
          v.literal('pick'),
          v.literal('ban'),
          v.literal('protect'),
          v.literal('ready'),
          v.literal('start')
        ]),
        v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(1500 /* 15 minutes */)))
      ),
      bools: v.record(
        v.union([
          v.literal('doublePick'),
          v.literal('doubleBan'),
          v.literal('doubleProtect'),
          v.literal('banAndProtectCancelOut'),
          v.literal('forceNoFail')
        ]),
        v.optional(v.boolean())
      ),
      orders: v.record(
        v.union([v.literal('pick'), v.literal('ban'), v.literal('protect')]),
        v.optional(v.picklist(DraftOrderType.enumValues))
      ),
      winCondition: v.picklist(WinCondition.enumValues)
    })
  );

  public static UpdateTournamentSchedule = v.pipe(
    v.record(
      v.union([v.literal('tournament'), v.literal('playerRegs'), v.literal('staffRegs')]),
      v.optional(
        v.pipe(
          v.record(v.union([v.literal('start'), v.literal('end')]), v.optional(s.dateOrString())),
          v.check((i) => {
            if (i.end) {
              return !!i.start;
            }
            return true;
          }, 'Invalid date range: Expected the start date to be set if the end date is set'),
          v.check((i) => {
            if (i.start && i.end) {
              return i.start <= i.end;
            }
            return true;
          }, 'Invalid date range: Expected the start date to be before the end date'),
          v.check((i) => {
            const now = new Date();

            return !Object.values(i)
              .filter((value) => value !== null)
              .some((date) => date < now);
          }, 'Invalid date range: Expected all dates to be in the future')
        )
      )
    ),
    v.check((i) => {
      if (i.playerRegs || i.staffRegs) {
        return !!i.tournament?.start;
      }
      return true;
    }, 'Invalid date range: Expected the tournament publish date to be set if player or staff registration dates are also set'),
    v.check((i) => {
      if (i.tournament && i.tournament.end) {
        return !!i.playerRegs && !!i.staffRegs;
      }
      return true;
    }, 'Invalid date range: Expected the tournament player and staff registration dates to be set if the conclusion date is also set'),
    v.transform((i) => ({
      publishedAt: i.tournament?.start ?? null,
      playerRegsOpenedAt: i.playerRegs?.start ?? null,
      playerRegsClosedAt: i.playerRegs?.end ?? null,
      staffRegsOpenedAt: i.staffRegs?.start ?? null,
      staffRegsClosedAt: i.staffRegs?.end ?? null,
      concludedAt: i.tournament?.end ?? null
    }))
  );

  public static UpdateTournament = v.pipe(
    v.partial(
      v.object({
        ...this.BaseMutateTournament.entries,
        bws: v.nullable(this.Bws),
        useTeamBanners: v.boolean(),
        refereeSettings: this.UpdateTournamentRefereeSettings,
        schedule: this.UpdateTournamentSchedule
      })
    )
  );
}

export type TournamentValidationOutput = MapOutput<typeof TournamentValidation>;
export type TournamentValidationInput = MapInput<typeof TournamentValidation>;
