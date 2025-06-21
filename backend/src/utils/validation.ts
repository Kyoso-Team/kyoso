import { is, SQL } from 'drizzle-orm';
import * as v from 'valibot';

export const integerId = () => v.pipe(v.number(), v.integer(), v.minValue(1));

export const bigintId = () => v.pipe(v.bigint(), v.minValue(1n));

export const nonEmptyString = () => v.pipe(v.string(), v.nonEmpty());

export const stringToInteger = () =>
  v.pipe(v.string(), v.nonEmpty(), v.transform(Number), v.number(), v.integer());

export const stringToBoolean = () =>
  v.pipe(
    v.union([v.literal('true'), v.literal('false')]),
    v.transform((v) => v === 'true'),
    v.boolean()
  );

export const validUrlSlug = () =>
  v.custom<string>(
    (value) => (typeof value === 'string' ? /^[a-z0-9_]+$/g.test(value) : false),
    'Invalid slug: Expected to only contain any of the following characters: abcdefghijkmnlopqrstuvwxyz0123456789_'
  );

export const deletionDate = (valueIfUndefined?: SQL | Date) =>
  v.nullable(v.optional(v.union([v.date(), v.custom((v) => is(v, SQL))]), valueIfUndefined));

export const dateOrString = () =>
  v.union([
    v.date(),
    v.pipe(
      v.string(),
      v.transform((v) => new Date(v)),
      v.date()
    )
  ]);

export const OAuthToken = v.object({
  /** Encrypted using JWT */
  accessToken: nonEmptyString(),
  /** Encrypted using JWT */
  refreshToken: nonEmptyString(),
  /** Timestamp in milliseconds */
  tokenIssuedAt: v.pipe(v.number(), v.integer())
});
export type OAuthToken = v.InferOutput<typeof OAuthToken>;
