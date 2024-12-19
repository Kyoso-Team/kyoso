import * as v from 'valibot';
import * as s from '$src/utils/validation';

const CreateSession = v.object({
  id: s.nonEmptyString(),
  userAgent: v.nullish(v.pipe(v.string(), v.nonEmpty())),
  ipAddress: v.pipe(v.string(), v.ip()),
  ipMetadata: v.partial(
    v.object({
      city: v.string(),
      region: v.string(),
      country: v.string()
    })
  ),
  userId: s.integerId()
});

export const SessionValidation = { CreateSession };
