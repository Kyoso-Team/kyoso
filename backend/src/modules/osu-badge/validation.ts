import * as v from 'valibot';
import * as s from '$src/utils/validation';
import type { MapInput, MapOutput } from '$src/types';

export abstract class OsuBadgeValidation {
  public static UpsertOsuBadge = v.object({
    imgFileName: s.nonEmptyString(),
    description: v.optional(v.string())
  });

  public static CreateOsuUserAwardedBadge = v.object({
    imgFileName: s.nonEmptyString(),
    awardedAt: v.union([
      v.date(),
      v.pipe(
        s.nonEmptyString(),
        v.transform((v) => new Date(v))
      )
    ])
  });
}

export type OsuBadgeValidationOutput = MapOutput<typeof OsuBadgeValidation>;
export type OsuBadgeValidationInput = MapInput<typeof OsuBadgeValidation>;
