import * as v from 'valibot';
import * as s from '$src/utils/validation';
import { validationError } from './error';

export const Env = v.object({
  NODE_ENV: v.optional(
    v.union([v.literal('development'), v.literal('production'), v.literal('test')]),
    'development'
  ),

  DATABASE_URL: s.nonEmptyString(),
  TEST_DATABASE_URL: s.nonEmptyString(),

  PUBLIC_OSU_CLIENT_ID: s.nonEmptyString(),
  OSU_CLIENT_SECRET: s.nonEmptyString(),
  PUBLIC_OSU_REDIRECT_URI: v.pipe(v.string(), v.nonEmpty()),

  PUBLIC_DISCORD_CLIENT_ID: s.nonEmptyString(),
  DISCORD_CLIENT_SECRET: s.nonEmptyString(),
  PUBLIC_DISCORD_MAIN_REDIRECT_URI: s.nonEmptyString(),
  PUBLIC_DISCORD_CHANGE_ACCOUNT_REDIRECT_URI: s.nonEmptyString(),
  DISCORD_BOT_TOKEN: s.nonEmptyString(),

  REDIS_URL: s.nonEmptyString(),
  TEST_REDIS_URL: s.nonEmptyString(),

  S3_FORCE_PATH_STYLE: s.stringToBoolean(),
  S3_ENDPOINT: s.nonEmptyString(),
  S3_REGION: s.nonEmptyString(),
  S3_ACCESS_KEY_ID: s.nonEmptyString(),
  S3_SECRET_ACCESS_KEY: s.nonEmptyString(),

  IPINFO_ACCESS_TOKEN: s.nonEmptyString(),

  KYOSO_OWNER: s.stringToInteger()
});

export type Env = v.InferOutput<typeof Env>;

export const env = await v
  .parseAsync(Env, Bun.env)
  .catch(validationError('Failed to parse env', 'env'));
