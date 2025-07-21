import Elysia from 'elysia';

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
