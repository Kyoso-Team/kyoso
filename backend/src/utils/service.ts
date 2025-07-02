import * as v from 'valibot';
import { env } from './env';
import { UnknownError, unknownError, validationError } from './error';
import type { QueryWrapper } from './repository';
import { logger } from '$src/singletons';
import type { DatabaseClient, DatabaseTransactionClient } from '$src/types';

export abstract class Service {
  constructor(private operation: 'request' | 'job', private operationId: string) {}

  /**
   * "Operation" could be a request or a background job
   */
  protected async execute<T extends QueryWrapper<any>>(wrapped: T): Promise<Awaited<ReturnType<T['execute']>>> {
    let logMsg = `${this.operation === 'request' ? 'Request' : 'Background job'} ${this.operationId} - ${wrapped.meta.name} (${wrapped.meta.queryType}) - `;
    let failed = false;
    const start = performance.now();

    try {
      return await wrapped.execute();
    } catch (err) {
      failed = true;
      throw new UnknownError(`${wrapped.meta.name} (${wrapped.meta.queryType}) failed in ${this.operation} ${this.operationId}`, {
        cause: err
      });
    } finally {
      const duration = performance.now() - start;
      logMsg += `${failed ? 'Failed' : 'Success'} in ${Math.round(duration)}ms - `;

      if (wrapped.meta.queryType === 'db') {
        logMsg += `${wrapped.meta.query}${
          wrapped.meta.params.length > 0 && env.NODE_ENV !== 'production'
            ? ` [${wrapped.meta.params.join(', ')}]`
            : ''
        }`;
      } else if (wrapped.meta.queryType === 'kv') {
        logMsg += `${wrapped.meta.method} "${wrapped.meta.key}"${
          wrapped.meta.value ? ` to "${wrapped.meta.value}"` : ''
        }${wrapped.meta.expires ? ` to expire in ${wrapped.meta.expires}ms` : ''}`;
      }

      if (failed) {
        logger.error(logMsg);
      } else {
        logger.info(logMsg);
      }
    }
  }

  protected async fetch<TDataSchema extends v.GenericSchema, T = undefined>(settings: {
    url: string | URL,
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    error: {
      fetchFailed: string;
      unhandledStatus: string;
      validationFailed: string;
      parseFailed: string;
    },
    schema: TDataSchema,
    handleNonOkStatus?: (resp: Response) => T
    body?: Record<string, any>;
    headers?: HeadersInit;
  }
  ): Promise<T extends undefined | void ? v.InferOutput<TDataSchema> : v.InferOutput<TDataSchema> | T> {
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
    return await v.parseAsync(schema, data).catch(validationError(error.validationFailed, 'response')) as any;
  }

  // TODO: Handle errors and rollbacks properly
  protected async transaction<T>(db: DatabaseClient, txName: string, transactionFn: (tx: DatabaseTransactionClient) => Promise<T>) {
    let logMsg = `${this.operation === 'request' ? 'Request' : 'Background job'} ${this.operationId} - ${txName} (tx) - `;
    const start = performance.now();

    try {
      logger.info(`${logMsg}Start`);
      return await db.transaction(async (tx) => {
        await transactionFn(tx);
      });
    } finally {
      const duration = performance.now() - start;
      logMsg += `Completed in ${Math.round(duration)}ms`;
      logger.info(logMsg);
    }
  }
}
