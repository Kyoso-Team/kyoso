import Elysia from 'elysia';

export const elysia = (base: string) => new Elysia({
  prefix: base
})
  .onRequest(({ set }) => {
    set.headers['x-request-id'] = Bun.randomUUIDv7();
  })
  .derive(({ set }) => {
    return { requestId: set.headers['x-request-id']! };
  });