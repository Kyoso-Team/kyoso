import * as v from 'valibot';
import * as s from '$src/utils/validation';

const CreateOsuBadge = v.object({
  imgFileName: s.nonEmptyString(),
  description: v.optional(v.string())
});

export type OsuBadgeValidationOutput = {
  CreateOsuBadge: v.InferOutput<typeof CreateOsuBadge>;
}

export const OsuBadgeValidation = {
  CreateOsuBadge
};
