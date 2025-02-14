import * as v from 'valibot';
import * as s from '$src/utils/validation';
import type { MapInput, MapOutput } from '$src/types';

export abstract class AuthenticationValidation {
  public static OAuthToken = v.object({
    /** Encrypted using JWT */
    accessToken: s.nonEmptyString(),
    /** Encrypted using JWT */
    refreshToken: s.nonEmptyString(),
    /** Timestamp in milliseconds */
    tokenIssuedAt: v.pipe(v.number(), v.integer())
  });
}

export type AuthenticationValidationOutput = MapOutput<typeof AuthenticationValidation>;
export type AuthenticationValidationInput = MapInput<typeof AuthenticationValidation>;
