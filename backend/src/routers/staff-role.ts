import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import * as v from 'valibot';
import { sessionMiddleware } from '$src/middlewares/session';
import { StaffRoleValidation } from '$src/modules/staff-role/validation';
import * as s from '$src/utils/validation';

export const staffRoleRouter = new Hono()
  .basePath('staff/role')
  .use(sessionMiddleware())
  .post('/', vValidator('json', StaffRoleValidation.CreateStaffRole), async (c) => {
    const _body = c.req.valid('json');

    return c.json({ message: 'Staff role created' });
  })
  .patch(
    '/:staffRoleId',
    vValidator(
      'param',
      v.object({
        staffRoleId: s.stringToInteger()
      })
    ),
    vValidator('json', StaffRoleValidation.UpdateStaffRole),
    async (c) => {
      const _params = c.req.valid('param');
      const _body = c.req.valid('json');

      return c.json({ message: 'Staff role updated' });
    }
  );
