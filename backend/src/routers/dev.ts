import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import * as v from 'valibot';
import { authMiddleware } from '$src/middlewares/auth.ts';
import { devService } from '$src/modules/dev/service.ts';
import { integerId } from '$src/utils/validation.ts';

export const devRouter = new Hono()
  .basePath('/dev')
  .use(authMiddleware)
  .put(
    'impersonate',
    vValidator(
      'json',
      v.object({
        userId: integerId()
      })
    ),
    async (c) => {
      if (!c.req.header('User-Agent')) {
        throw new HTTPException(400, {
          message: '"User-Agent" header is undefined'
        });
      }

      const body = c.req.valid('json');

      return devService.impersonate(c, body.userId);
    }
  );
