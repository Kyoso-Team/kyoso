import * as v from 'valibot';

const DiscordUserResponse = v.object({
  id: v.string(),
  username: v.string()
});

export const DiscordValidation = { DiscordUserResponse };
