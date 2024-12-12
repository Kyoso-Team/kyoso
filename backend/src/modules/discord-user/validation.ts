import * as v from 'valibot';
import * as s from '$src/utils/validation';
import { AuthenticationValidation } from '../authentication/validation';

const CreateDiscordUser = v.object({
  userId: s.integerId(),
  discordUserId: s.bigintId(),
  username: v.pipe(v.string(), v.minLength(1), v.maxLength(32)),
  token: AuthenticationValidation.OAuthToken
});

const UpdateDiscordUser = v.partial(v.omit(CreateDiscordUser, ['userId', 'discordUserId']));

export const DiscordUserValidation = { CreateDiscordUser, UpdateDiscordUser };
