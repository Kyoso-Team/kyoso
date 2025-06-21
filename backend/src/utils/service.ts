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

  protected async fetch<T extends v.GenericSchema>(
    url: string | URL,
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
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
    return await v.parseAsync(schema, data).catch(validationError(errorMessage, item));
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
