import * as v from 'valibot';
import { TournamentType } from '$src/schema';
import * as s from '$src/utils/validation';
import type { MapInput, MapOutput } from '$src/types';

export abstract class TournamentValidation {
  public static BwsValues = v.record(
    v.union([v.literal('x'), v.literal('y'), v.literal('z')]),
    v.pipe(v.number(), v.notValue(0), v.minValue(-10), v.maxValue(10))
  );

  public static CreateTournament = v.object({
    name: v.pipe(v.string(), v.minLength(2), v.maxLength(50)),
    urlSlug: v.pipe(v.string(), v.minLength(2), v.maxLength(16), s.validUrlSlug()),
    acronym: v.pipe(v.string(), v.minLength(2), v.maxLength(8)),
    type: v.picklist(TournamentType.enumValues),
    hostUserId: s.integerId()
  });

  public static UpdateTournament = v.partial(v.omit(this.CreateTournament, ['type', 'hostUserId']));
}

export type TournamentValidationOutput = MapOutput<typeof TournamentValidation>;
export type TournamentValidationInput = MapInput<typeof TournamentValidation>;
