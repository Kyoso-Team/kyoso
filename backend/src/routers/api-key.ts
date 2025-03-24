import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import * as v from 'valibot';
import { sessionMiddleware } from '$src/middlewares/session';
import { apiKeyService } from '$src/modules/api-key/service';
import * as s from '$src/utils/validation';

export const apiKeyRouter = new Hono()
  .basePath('keys')
  .use(sessionMiddleware())
  .get('/', async (c) => {
    const keys = await apiKeyService.getUserApiKeys(c.get('user').id);
    return c.json({ keys });
  })
  .post('/', async (c) => {
    const key = await apiKeyService.createApiKey(c.get('user').id);
    return c.json({ key });
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

      await apiKeyService.deleteApiKey(apiKeyId, c.get('user').id);

      return c.json({ message: 'Successfully deleted API key' });
    }
  );
