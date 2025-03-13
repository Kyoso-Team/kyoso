import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import * as v from 'valibot';
import { sessionMiddleware } from '$src/middlewares/session';
import { staffRoleService } from '$src/modules/staff-role/service';
import { StaffRoleValidation } from '$src/modules/staff-role/validation';
import { db } from '$src/singletons';
import * as s from '$src/utils/validation';

export const staffRoleRouter = new Hono()
  .basePath('staff/role')
  .use(sessionMiddleware())
  .post('/', vValidator('json', StaffRoleValidation.CreateStaffRole), async (c) => {
    const body = c.req.valid('json');

    await staffRoleService.createStaffRole(db, body);

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
      const { staffRoleId } = c.req.valid('param');
      const body = c.req.valid('json');

      await staffRoleService.updateStaffRole(db, body, staffRoleId);

      return c.json({ message: 'Staff role updated' });
    }
  )
  .patch(
    '/:staffRoleId/order',
    vValidator(
      'param',
      v.object({
        staffRoleId: s.stringToInteger()
      })
    ),
    vValidator('json', StaffRoleValidation.SwapStaffRoles),
    async (c) => {
      const { staffRoleId } = c.req.valid('param');
      const body = c.req.valid('json');

      await staffRoleService.swapStaffRoles(db, body, staffRoleId);

      return c.json({ message: 'Staff role orders swapped' });
    }
  )
  .delete(
    '/:staffRoleId',
    vValidator(
      'param',
      v.object({
        staffRoleId: s.stringToInteger()
      })
    ),
    async (c) => {
      const { staffRoleId } = c.req.valid('param');

      await staffRoleService.deleteStaffRole(db, staffRoleId);

      return c.json({ message: 'Staff role deleted' });
    }
  );
