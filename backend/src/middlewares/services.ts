import { createMiddleware } from 'hono/factory';

export const servicesMiddleware = <T extends Record<string, any>>(services: T) =>
  createMiddleware<{
    Variables: { [K in keyof T]: InstanceType<T[K]> };
  }>(async (c, next) => {
    for (const [key, ServiceClass] of Object.entries(services)) {
      c.set(key, new ServiceClass('request', c.get('requestId')));
    }

    await next();
  });
