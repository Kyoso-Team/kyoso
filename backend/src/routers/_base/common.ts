import Elysia, { status, t as t1 } from 'elysia';
import { env } from '$src/utils/env';
import { ExpectedError } from '$src/utils/error';

export const t = {
  ...t1,
  IntegerId: () =>
    t1.Integer({
      minimum: 0
    }),
  IntegerIdString: () => t1.Numeric({
    minimum: 0
  }),
  DateString: () => t1.String({
    format: 'date-time'
  })
};

export type RouterConfig = {
  name?: string;
  prefix?: string;
};

export const initServices = <TServices extends Record<string, any> = {}>(services: TServices) => new Elysia()
  .resolve({ as: 'global' }, ({ set }) => {
    const requestId = set.headers['x-request-id']!;
    const mapped: Record<string, any> = {};

    if (services) {
      for (const [key, ServiceClass] of Object.entries(services)) {
        mapped[key] = new ServiceClass('request', requestId);
      }
    }

    return mapped as { [K in keyof TServices]: InstanceType<TServices[K]> };
  });

export const common = (config?: RouterConfig) => new Elysia(config)
  .onRequest(({ set }) => {
    set.headers['x-request-id'] = Bun.randomUUIDv7();
  })
  .derive({ as: 'global' }, ({ set }) => ({ requestId: set.headers['x-request-id']! }))
  .onTransform(({ query }) => {
    for (const key in query) {
      if (query[key] === 'undefined') {
        query[key] = undefined as any;
      }
    }
  })
  .macro({
    testOnly: {
      beforeHandle: () => {
        if (env.NODE_ENV !== 'test') {
          return status(403, 'This endpoint is only available in test environment');
        }
      }
    },
    devOnly: {
      beforeHandle: () => {
        if (env.NODE_ENV !== 'development') {
          return status(403, 'This endpoint is only available in development environment');
        }
      }
    },
    nonEmptyBody: {
      beforeHandle: ({ body }) => {
        if (typeof body === 'object' && Object.keys(body ?? {}).length === 0) {
          return status(422, 'Body cannot be empty');
        }
      }
    }
  })
  .onError(({ error }) => {
    if (error instanceof ExpectedError) {
      return status(error.status, error.message);
    }
  });



