import * as v from 'valibot';
import { unknownError, validationError } from '$src/utils/error';
import { DiscordValidation } from './validation';

async function getDiscordSelf(accessToken: string) {
  const user = await fetch('https://discord.com/oauth2/@me', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
    .then((res) => res.json() as Record<string, any>)
    .catch(unknownError('Failed to get discord user data'));

  const parsed = await v
    .parseAsync(DiscordValidation.DiscordUserResponse, user)
    .catch(validationError('Failed to parse discord user data', 'discordUser'));
  return parsed;
}

export const discordService = { getDiscordSelf };
