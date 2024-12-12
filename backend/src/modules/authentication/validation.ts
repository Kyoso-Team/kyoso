import * as v from 'valibot';
import * as s from '$src/utils/validation';

const OAuthToken = v.object({
  /** Encrypted using JWT */
  accessToken: s.nonEmptyString(),
  /** Encrypted using JWT */
  refreshToken: s.nonEmptyString(),
  /** Timestamp in milliseconds */
  tokenIssuedAt: v.pipe(v.number(), v.integer())
});

const IpInfoResponse = v.object({
  city: v.string(),
  region: v.string(),
  country: v.string()
});

export const AuthenticationValidation = {
  OAuthToken,
  IpInfoResponse
};
