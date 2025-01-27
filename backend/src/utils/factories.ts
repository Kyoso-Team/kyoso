import * as v from 'valibot';
import { unknownError, validationError } from './error';
import type { DatabaseClient, RedisClient } from '$src/types';

export class ServiceFactory<
  TQuery extends
    | ((db: DatabaseClient, ...args: any[]) => Promise<any>)
    | ((redis: RedisClient, ...args: any[]) => Promise<any>)
> {
  constructor(
    private repositoryQuery: TQuery,
    private errorMessage: string
  ) {}

  public create() {
    return async (...args: Parameters<TQuery>): Promise<Awaited<ReturnType<TQuery>>> => {
      const db = args.shift();
      return await this.repositoryQuery(db, ...args).catch(unknownError(this.errorMessage));
    };
  }

  public createWithValidation<TSchema extends v.GenericSchema>(schema: TSchema, item: string) {
    return async (...args: Parameters<TQuery>): Promise<Awaited<ReturnType<TQuery>>> => {
      const db = args.shift();
      const data = args.shift();
      const parsed = await v
        .parseAsync(schema, data)
        .catch(validationError(this.errorMessage, item));
      return await this.repositoryQuery(db, parsed, ...args).catch(unknownError(this.errorMessage));
    };
  }
}
