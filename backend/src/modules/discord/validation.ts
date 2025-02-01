import type { MapInput, MapOutput } from '$src/types';
import * as v from 'valibot';

export abstract class DiscordValidation {
  public static DiscordUserResponse = v.object({
    id: v.string(),
    username: v.string()
  });
}

export type DiscordValidationOutput = MapOutput<typeof DiscordValidation>;
export type DiscordValidationInput = MapInput<typeof DiscordValidation>;
