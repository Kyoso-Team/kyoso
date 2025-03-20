import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import * as v from 'valibot';
import { staffPermissionsMiddleware } from '$src/middlewares/permissions';
import { sessionMiddleware } from '$src/middlewares/session';
import { staffMemberService } from '$src/modules/staff-member/service';
import { StaffMemberValidation } from '$src/modules/staff-member/validation';
import { db } from '$src/singletons';
import * as s from '$src/utils/validation';

export const staffMemberRouter = new Hono()
  .basePath('staff/member')
  .use(sessionMiddleware())
  .patch(
    ':staffMemberId/roles',
    vValidator('param', v.object({ staffMemberId: s.stringToInteger() })),
    vValidator('json', StaffMemberValidation.UpdateStaffMember),
    staffPermissionsMiddleware(['manage_tournament']),
    async (c) => {
      const body = c.req.valid('json');

      await staffMemberService.updateStaffMemberRoles(db, body);

      return c.json({ message: 'Staff member roles updated' });
    }
  )
  .delete(
    'leave',
    vValidator('query', v.object({ tournamentId: s.stringToInteger() })),
    staffPermissionsMiddleware(),
    async (c) => {
      const { id: userId } = c.get('user');
      const { id: tournamentId, hostUserId } = c.get('tournament');

      await staffMemberService.leaveStaffTeam(userId, tournamentId, hostUserId);

      return c.json({ message: 'Left tournament' });
    }
  )
  .delete(
    'remove/:staffMemberId',
    vValidator('param', v.object({ staffMemberId: s.stringToInteger() })),
    vValidator('query', v.object({ tournamentId: s.stringToInteger() })),
    staffPermissionsMiddleware(['manage_tournament']),
    async (c) => {
      const { staffMemberId } = c.req.valid('param');

      const staffMember = c.get('staffMember');
      const { id, hostUserId } = c.get('tournament');

      await staffMemberService.removeStaffMember(staffMember, staffMemberId, id, hostUserId);

      return c.json({ message: 'Staff member removed' });
    }
  );
