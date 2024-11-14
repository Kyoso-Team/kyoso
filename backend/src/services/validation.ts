import * as v from 'valibot';

export const nonEmptyString = () => v.pipe(v.string(), v.nonEmpty());

export const stringToInteger = () =>
  v.pipe(v.string(), v.nonEmpty(), v.transform(Number), v.number(), v.integer());

export const stringToBoolean = () =>
  v.pipe(
    v.union([v.literal('true'), v.literal('false')]),
    v.transform((v) => v === 'true'),
    v.boolean()
  );
