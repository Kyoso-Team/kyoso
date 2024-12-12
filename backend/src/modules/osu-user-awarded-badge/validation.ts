import * as v from 'valibot';
import * as s from '$src/utils/validation';

const CreateOsuUserAwardedBadge = v.object({
  imgFileName: s.nonEmptyString(),
  awardedAt: v.union([
    v.date(),
    v.pipe(
      s.nonEmptyString(),
      v.transform((v) => new Date(v))
    )
  ])
});

export const OsuUserAwardedBadgeValidation = {
  CreateOsuUserAwardedBadge
};
