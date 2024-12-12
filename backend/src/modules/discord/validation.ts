import * as v from 'valibot';

const DiscordUserResponse = v.pipe(
  v.object({
    user: v.object({
      id: v.string(),
      username: v.string()
    })
  }),
  v.transform((value) => value.user)
);

export const DiscordValidation = { DiscordUserResponse };
