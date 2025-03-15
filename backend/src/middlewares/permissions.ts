import { and, eq } from 'drizzle-orm';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { StaffMember, StaffMemberRole, StaffRole, Tournament, User } from '$src/schema';
import { db } from '$src/singletons';
import { pick } from '$src/utils/query';
import type { InferSelectModel } from 'drizzle-orm';
import type { Context } from 'hono';
import type { StaffPermission } from '$src/schema/enums';
import type { UserTokens } from './session';

export type StaffPermissions = (typeof StaffPermission.enumValues)[number];

export const staffPermissionsMiddleware = (permissions: StaffPermissions[]) => {
  return createMiddleware(
    async (
      c: Context<{
        Variables: {
          user: Pick<InferSelectModel<typeof User>, 'id' | 'admin' | 'approvedHost'> & UserTokens;
        };
      }>,
      next
    ) => {
      const payload =
        c.req.method !== 'GET' ? await c.req.json<{ tournamentId: string }>() : c.req.query();
      if (!payload.tournamentId || isNaN(parseInt(payload.tournamentId))) {
        throw new HTTPException(400, {
          message: 'Missing tournament ID'
        });
      }

      const tournament = await db
        .select(
          pick(Tournament, {
            hostUserId: true
          })
        )
        .from(Tournament)
        .where(eq(Tournament.id, +body.tournamentId))
        .then((rows) => rows[0]);

      if (!tournament) {
        throw new HTTPException(404, {
          message: 'Tournament not found'
        });
      }

      const staffMember = await db
        .select()
        .from(StaffMember)
        .leftJoin(StaffMemberRole, eq(StaffMember.id, StaffMemberRole.staffMemberId))
        .leftJoin(StaffRole, eq(StaffMemberRole.staffRoleId, StaffRole.id))
        .where(
          and(
            eq(StaffMember.userId, c.get('user').id),
            eq(StaffMember.tournamentId, +body.tournamentId)
          )
        );

      const staffMemberPermissions = new Set(
        staffMember.flatMap((staffMember) => staffMember.staff_role?.permissions ?? [])
      );

      if (
        staffMemberPermissions.isDisjointFrom(new Set(permissions)) &&
        tournament.hostUserId !== c.get('user').id
      ) {
        throw new HTTPException(403, {
          message: 'Forbidden'
        });
      }

      await next();
    }
  );
};
