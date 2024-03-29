import * as v from 'valibot';
import {
  PUBLIC_OSU_CLIENT_ID,
  PUBLIC_OSU_REDIRECT_URI,
  PUBLIC_DISCORD_CLIENT_ID,
  PUBLIC_DISCORD_MAIN_REDIRECT_URI,
  PUBLIC_DISCORD_CHANGE_ACCOUNT_REDIRECT_URI,
  PUBLIC_CONTACT_EMAIL
} from '$env/static/public';

export const nonEmptyStringSchema = v.string('be a string', [
  v.minLength(1, 'have 1 character or more')
]);

export const clientEnvSchema = v.object({
  PUBLIC_OSU_CLIENT_ID: v.number('be a number', [v.integer('be an integer')]),
  PUBLIC_OSU_REDIRECT_URI: nonEmptyStringSchema,
  PUBLIC_DISCORD_CLIENT_ID: nonEmptyStringSchema,
  PUBLIC_DISCORD_MAIN_REDIRECT_URI: nonEmptyStringSchema,
  PUBLIC_DISCORD_CHANGE_ACCOUNT_REDIRECT_URI: nonEmptyStringSchema,
  PUBLIC_CONTACT_EMAIL: v.string('be a string', [v.email('be an email')])
});

export const clientEnv = {
  PUBLIC_OSU_CLIENT_ID: Number(PUBLIC_OSU_CLIENT_ID),
  PUBLIC_OSU_REDIRECT_URI,
  PUBLIC_DISCORD_CLIENT_ID,
  PUBLIC_DISCORD_MAIN_REDIRECT_URI,
  PUBLIC_DISCORD_CHANGE_ACCOUNT_REDIRECT_URI,
  PUBLIC_CONTACT_EMAIL: PUBLIC_CONTACT_EMAIL || 'example@gmail.com'
};

export function parseEnv<T extends v.BaseSchema>(schema: T, env: unknown) {
  const parsed = v.safeParse(schema, env);

  if (!parsed.success) {
    const issues = v.flatten(parsed.issues).nested;

    for (const key in issues) {
      const split = key.split('.');
      console.error(
        `Env. variable "${split[0]}"${split[1] ? ` (at index ${split[1]})` : ''} must ${issues[key]}`
      );
    }

    throw new Error('Invalid environment variables');
  }

  return parsed.output;
}

const env = parseEnv(clientEnvSchema, clientEnv);
export default env;
