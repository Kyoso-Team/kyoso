import * as v from 'valibot';
import * as s from '$src/utils/validation';

const UpsertOsuBadge = v.object({
  imgFileName: s.nonEmptyString(),
  description: v.optional(v.string())
});

export const OsuBadgeValidation = {
  UpsertOsuBadge
};
