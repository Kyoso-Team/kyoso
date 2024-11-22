import * as v from 'valibot';
import type { DatabaseClient } from '$src/types';
import { unknownError, validationError } from './error';

export function createServiceFnFromRepositoryQuery<
  TSchema extends v.GenericSchema,
  TQuery extends (db: DatabaseClient, data: v.InferOutput<TSchema>, ...args: any[]) => Promise<any>
>(
  schema: TSchema,
  repositoryQuery: TQuery,
  item: string,
  errorMessage: string
) {
  return async (...args: Parameters<TQuery>): Promise<Awaited<ReturnType<TQuery>>> => {
    const db = args.shift();
    const data = args.shift();
    const parsed = await v.parseAsync(schema, data).catch(
      validationError(errorMessage, item)
    );
    return await repositoryQuery(db, parsed, ...args).catch(unknownError(errorMessage));
  };
}
