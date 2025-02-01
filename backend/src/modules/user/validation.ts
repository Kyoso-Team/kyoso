import type { MapInput, MapOutput } from '$src/types';
import * as v from 'valibot';
import * as s from '$src/utils/validation';
import { AuthenticationValidation } from '../authentication/validation';

export abstract class UserValidation {
  public static CreateUser = v.object({
    admin: v.boolean(),
    approvedHost: v.boolean()
  });

  public static UpdateUser = this.CreateUser;

  public static CreateCountry = v.object({
    code: v.pipe(v.string(), v.length(2), v.toUpperCase()),
    name: v.pipe(v.string(), v.maxLength(35))
  });

  public static CreateOsuUser = v.object({
    ...v.entriesFromList(
      ['globalStdRank', 'globalTaikoRank', 'globalManiaRank', 'globalCatchRank'],
      v.optional(v.nullable(v.pipe(v.number(), v.integer())))
    ),
    userId: s.integerId(),
    osuUserId: s.integerId(),
    username: v.pipe(v.string(), v.nonEmpty(), v.maxLength(15)),
    restricted: v.boolean(),
    token: AuthenticationValidation.OAuthToken,
    countryCode: v.pipe(v.string(), v.length(2), v.toUpperCase())
  });
  
  public static UpdateOsuUser = v.partial(v.omit(this.CreateOsuUser, ['userId', 'osuUserId']));

  public static CreateDiscordUser = v.object({
    userId: s.integerId(),
    discordUserId: s.bigintId(),
    username: v.pipe(v.string(), v.minLength(1), v.maxLength(32)),
    token: AuthenticationValidation.OAuthToken
  });
  
  public static UpdateDiscordUser = v.partial(v.omit(this.CreateDiscordUser, ['userId', 'discordUserId']));
}

export type UserValidationOutput = MapOutput<typeof UserValidation>;
export type UserValidationInput = MapInput<typeof UserValidation>;
