import { Discord, Osu } from 'arctic';
import { env } from '$src/utils/env';

export const osuOAuth = new Osu(
  env.PUBLIC_OSU_CLIENT_ID,
  env.OSU_CLIENT_SECRET,
  env.PUBLIC_OSU_REDIRECT_URI
);

export const mainDiscordOAuth = new Discord(
  env.PUBLIC_DISCORD_CLIENT_ID,
  env.DISCORD_CLIENT_SECRET,
  env.PUBLIC_DISCORD_CLIENT_ID
);

export const changeAccountDiscordOAuth = new Discord(
  env.PUBLIC_DISCORD_CLIENT_ID,
  env.DISCORD_CLIENT_SECRET,
  env.PUBLIC_DISCORD_CHANGE_ACCOUNT_REDIRECT_URI
);
