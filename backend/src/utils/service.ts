import * as v from 'valibot';
import { logger } from '$src/singletons';
import { UnknownError, unknownError, validationError } from './error';
import type { AwaitedReturnType, DatabaseClient, DatabaseTransactionClient } from '$src/types';
import type { QueryMeta, QueryWrapper } from '../modules/_base/repository';

export abstract class Service {
  public static devOnly = (_: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      if (process.env.NODE_ENV !== 'development') {
        throw new Error(
          `This method can only be called in development environment: ${propertyKey}`
        );
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };

  public static testOnly = (_: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      if (process.env.NODE_ENV !== 'test') {
        throw new Error(`This method can only be called in test environment: ${propertyKey}`);
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };

  constructor(
    private operation: 'request' | 'job' | 'test-setup',
    private operationId: string
  ) {}

  /**
   * "Operation" could be a request or a background job
   */
  protected async execute<T extends QueryWrapper<any>>(
    wrapped: T,
    errorHandler?: (error: unknown) => never
  ): Promise<AwaitedReturnType<T['execute']>> {
    let failed = false;
    let error: any;
    const start = performance.now();

    try {
      return await wrapped.execute();
    } catch (err) {
      failed = true;
      error = err;

      if (errorHandler) {
        errorHandler(err);
      }

      throw new UnknownError(
        `${wrapped.meta.name} (${wrapped.meta.queryType}) failed in ${this.operation} ${this.operationId}`,
        {
          cause: err
        }
      );
    } finally {
      const duration = performance.now() - start;
      const logMsg = this.buildLogMsg(failed, duration, wrapped.meta);

      if (failed) {
        logger.error(logMsg);
        logger.error(error);
      } else {
        logger.info(logMsg);
      }
    }
  }

  protected async fetch<TDataSchema extends v.GenericSchema, T = undefined>(settings: {
    url: string | URL;
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    error: {
      fetchFailed: string;
      unhandledStatus: string;
      validationFailed: string;
      parseFailed: string;
    };
    schema: TDataSchema;
    handleNonOkStatus?: (resp: Response) => T;
    body?: Record<string, any>;
    headers?: HeadersInit;
  }): Promise<
    T extends undefined | void ? v.InferOutput<TDataSchema> : v.InferOutput<TDataSchema> | T
  > {
    const { url, method, error, schema, body, headers } = settings;
    const resp = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    }).catch(unknownError(error.fetchFailed));

    if (!resp.ok) {
      let handled: any = undefined;

      if (settings.handleNonOkStatus) {
        handled = settings.handleNonOkStatus?.(resp.clone());
      }

      if (handled !== undefined) {
        return handled;
      }

      throw new UnknownError(error.unhandledStatus, { cause: resp });
    }

    const data = await resp.json().catch(unknownError(error.parseFailed));
    return (await v
      .parseAsync(schema, data)
      .catch(validationError(error.validationFailed, 'response'))) as any;
  }

  // TODO: Handle errors and rollbacks properly
  protected async transaction<T>(
    db: DatabaseClient,
    txName: string,
    transactionFn: (tx: DatabaseTransactionClient) => Promise<T>,
    errorHandler?: (error: unknown) => never
  ): Promise<T> {
    let logMsg = `${this.operation === 'request' ? 'Request' : 'Background job'} ${this.operationId} - ${txName} (tx) - `;
    const start = performance.now();

    try {
      logger.info(`${logMsg}Start`);
      return await db.transaction(async (tx) => await transactionFn(tx));
    } catch (err) {
      if (errorHandler) {
        errorHandler(err);
      } else {
        throw err;
      }

      return undefined as any;
    } finally {
      const duration = performance.now() - start;
      logMsg += `Completed in ${Math.round(duration)}ms`;
      logger.info(logMsg);
    }
  }

  private buildLogMsg(failed: boolean, duration: number, meta: QueryMeta) {
    let logMsg = `${this.operation === 'request' ? 'Request' : this.operation === 'job' ? 'Background job' : 'Test setup'} ${this.operationId} - ${meta.name} (${meta.queryType}) - ${failed ? 'Failed' : 'Success'} in ${Math.round(duration)}ms - `;

    if (meta.queryType === 'db') {
      const params = meta.params.length > 0 ? ` - [${meta.params.join(', ')}]` : '';
      const o = meta.output.get();
      const mo = meta.mappedOutput.get();
      const output = o && o !== 'undefined' ? ` - Received ${o} and mapped to ${mo}` : '';

      logMsg += `${meta.query}${params}${output}`;
    } else if (meta.queryType === 'kv') {
      const input = meta.input && meta.input !== 'undefined'
          ? ` set to "${meta.input}"`
          : '';
      const expires = meta.expires ? ` to expire in ${meta.expires}ms` : '';
      const o = meta.output?.get();
      const mo = meta.mappedOutput?.get();
      const output = o && o !== 'undefined' ? ` - Received ${o} and mapped to ${mo}` : '';

      logMsg += `${meta.method} "${meta.key}"${input}${expires}${output}`;
    } else if (meta.queryType === 'search') {
      const input =
        meta.input && meta.input !== 'undefined'
          ? ` with input "${meta.input}"`
          : '';
      const o = meta.output?.get();
      const output = o && o !== 'undefined' ? ` - Received ${o}` : '';
      const document = meta.documentId
        ? ` - Affected document with ID "${meta.documentId}"`
        : '';
      const search = meta.search ? ` with query "${meta.search.query}"` : '';

      logMsg += `${meta.index}.${meta.method}${search}${input}${document}${output}`;
    }

    return logMsg;
  }
}
