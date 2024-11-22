import * as v from 'valibot';
import * as s from '$src/utils/validation';

export const OAuthToken = v.object({
  /** Encrypted using JWT */
  accesstoken: s.nonEmptyString(),
  /** Encrypted using JWT */
  refreshToken: s.nonEmptyString(),
  /** Timestamp in milliseconds */
  tokenIssuedAt: v.pipe(v.number(), v.integer())
});

export const AuthenticationValidation = {
  OAuthToken
};
