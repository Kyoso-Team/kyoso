import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import * as v from 'valibot';
import { sessionMiddleware } from '$src/middlewares/session';
import { ApiKeyService } from '$src/modules/api-key/api-key.service';
import * as s from '$src/utils/validation';
import { servicesMiddleware } from '$src/middlewares/services';

export const apiKeyRouter = new Hono()
  .basePath('api-keys')
  .use(servicesMiddleware({
    apiKeyService: ApiKeyService
  }))
  .use(sessionMiddleware())
  .get('/', async (c) => {
    const keys = await c.var.apiKeyService.getUserApiKeys(c.get('user').id);
    return c.json(keys);
  })
  .post('/', async (c) => {
    const key = await c.var.apiKeyService.createApiKey(c.get('user').id);
    return c.json(key);
  })
  .delete(
    '/:apiKeyId',
    vValidator(
      'param',
      v.object({
        apiKeyId: s.integerId()
      })
    ),
    async (c) => {
      const { apiKeyId } = c.req.valid('param');

      await c.var.apiKeyService.deleteApiKey(apiKeyId, c.get('user').id);

      return c.json({ message: 'Successfully deleted API key' });
    }
  );
