import * as v from 'valibot';
import * as s from '$src/utils/validation';
import { AuthenticationValidation } from '../authentication/validation';

const CreateOsuUser = v.object({
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

const UpdateOsuUser = v.partial(v.omit(CreateOsuUser, ['userId', 'osuUserId']));

export const OsuUserValidation = {
  CreateOsuUser,
  UpdateOsuUser
};
