import * as v from 'valibot';
import { env } from './env';
import { unknownError, validationError } from './error';

export abstract class Service {
  protected checkTest() {
    if (env.NODE_ENV !== 'test') {
      throw new Error('Operation only allowed in test environment');
    }
  }

  protected createServiceFunction(errorMessage: string) {
    return new ServiceFunction(errorMessage);
  }

  protected async fetch<T extends v.GenericSchema>(
    url: string | URL,
    method: 'GET' | 'POST',
    errorMessage: string,
    schema: T,
    item: string,
    options?: {
      body?: Record<string, any>;
      headers?: HeadersInit;
    }
  ): Promise<v.InferOutput<T>> {
    const resp = await fetch(url, {
      method,
      body: options?.body ? JSON.stringify(options.body) : undefined,
      headers: options?.headers
    }).catch(unknownError(errorMessage));

    if (!resp.ok) {
      throw new Error('TODO: Handle non-200 responses from fetch');
    }

    const data = await resp.json().catch(unknownError(errorMessage));
    const parsed = await v.parseAsync(schema, data).catch(validationError(errorMessage, item));
    return parsed;
  }
}

class ServiceFunction {
  constructor(private errorMessage: string) {}

  public async validate<T extends v.GenericSchema>(
    schema: T,
    item: string,
    data: any
  ): Promise<v.InferOutput<T>> {
    return await v.parseAsync(schema, data).catch(validationError(this.errorMessage, item));
  }

  public async handleDbQuery<T>(query: Promise<T>): Promise<T> {
    return await query.catch(unknownError(this.errorMessage));
  }

  public async handleRedisQuery<T>(query: Promise<T>): Promise<T> {
    return await query.catch(unknownError(this.errorMessage));
  }

  public async handleSearchQuery<T>(query: Promise<T>): Promise<T> {
    return await query.catch(unknownError(this.errorMessage));
  }
}
