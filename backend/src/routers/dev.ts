import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import * as v from 'valibot';
import { devCheckMiddleware } from '$src/middlewares/dev.ts';
import { sessionMiddleware } from '$src/middlewares/session.ts';
import { devService } from '$src/modules/dev/service.ts';
import { integerId } from '$src/utils/validation.ts';

export const devRouter = new Hono()
  .basePath('/dev')
  .use(devCheckMiddleware)
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
  )
  .patch(
    'change-permissions',
    vValidator(
      'json',
      v.object({
        admin: v.boolean(),
        approvedHost: v.boolean()
      })
    ),
    sessionMiddleware(),
    async (c) => {
      const body = c.req.valid('json');

      const { id } = c.get('user');

      await devService.changePermissions(body, id);

      return c.text('Successfully updated user permissions');
    }
  );
