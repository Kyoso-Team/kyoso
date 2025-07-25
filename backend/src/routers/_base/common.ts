import Elysia, { status, t as t1 } from 'elysia';
import { env } from '$src/utils/env';

export const t = {
  ...t1,
  IntegerId: () =>
    t1.Integer({
      minimum: 0
    })
};

export type RouterConfig<TServices extends Record<string, any> = {}> = {
  name?: string;
  prefix?: string;
  services?: TServices;
};

export const common = <TServices extends Record<string, any> = {}>(
  config: RouterConfig<TServices>
) => new Elysia(config)
  .onRequest(({ set }) => {
    set.headers['x-request-id'] = Bun.randomUUIDv7();
  })
  .derive({ as: 'global' }, ({ set }) => ({ requestId: set.headers['x-request-id']! }))
  // Initialize services
  .resolve({ as: 'global' }, ({ requestId }) => {
    const mapped: Record<string, any> = {};

    if (config.services) {
      for (const [key, ServiceClass] of Object.entries(config.services)) {
        mapped[key] = new ServiceClass('request', requestId);
      }
    }

    return mapped as { [K in keyof TServices]: InstanceType<TServices[K]> };
  })
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
    }
  });



