import Elysia, { t as t1 } from 'elysia';

export const t = {
  ...t1,
  IntegerId: () => t1.Integer({
    minimum: 0
  })
};

type ElysiaConfig = {
	name?: string;
	prefix?: string;
};

export const elysia = (config: ElysiaConfig) =>
	new Elysia(config)
		.onRequest(({ set }) => {
			set.headers['x-request-id'] = Bun.randomUUIDv7();
		})
		.derive({ as: 'global' }, ({ set }) => {
			return { requestId: set.headers['x-request-id']! };
		});
