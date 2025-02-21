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

export const dateOrString = () => v.union([v.date(), v.pipe(v.string(), v.transform((v) => new Date(v)), v.date())]);

export const omitPiped = <
  TPiped extends v.SchemaWithPipe<[v.ObjectSchema<any, any>, ...any[]]>,
  TObject extends TPiped['pipe'][0],
  TEntries extends keyof TObject['entries'],
  TKeys extends [TEntries, ...TEntries[]],
  TRestPipe extends TPiped['pipe'] extends [infer _, ...infer TRest] ? TRest extends v.PipeItem<any, any, any>[] ? TRest : never : never
>(
  schema: TPiped,
  keys: TKeys
): v.SchemaWithPipe<[v.SchemaWithOmit<TObject, TKeys>, ...TRestPipe]> => {
  return v.pipe(v.omit(schema.pipe[0], keys), ...schema.pipe.slice(1)) as any;
};

/**
 * To avoid redundant validation in dynamic validation classes
 */
export const $assume = <T>() => {
  return v.any() as v.GenericSchema<T>;
};
