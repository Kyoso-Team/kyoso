import * as v from 'valibot';
import type { MapInput, MapOutput } from '$src/types';

export abstract class DiscordValidation {
  public static DiscordUserResponse = v.object({
    id: v.string(),
    username: v.string()
  });
}

export type DiscordValidationOutput = MapOutput<typeof DiscordValidation>;
export type DiscordValidationInput = MapInput<typeof DiscordValidation>;
