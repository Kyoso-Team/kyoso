import Elysia, { t as t1 } from 'elysia';

export const t = {
  ...t1,
  IntegerId: () => t1.Integer({
    minimum: 0
  })
};

export const elysia = (base: string) => new Elysia({
  prefix: base
})
  .onRequest(({ set }) => {
    set.headers['x-request-id'] = Bun.randomUUIDv7();
  })
  .derive(({ set }) => {
    return { requestId: set.headers['x-request-id']! };
  });