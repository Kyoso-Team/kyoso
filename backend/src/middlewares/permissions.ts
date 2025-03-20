import { and, eq, gt, isNull, or, sql } from 'drizzle-orm';
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

export type StaffMemberContext = InferSelectModel<typeof StaffMember> & {
  permissions: Set<StaffPermissions>;
};

export const staffPermissionsMiddleware = (permissions: StaffPermissions[] = []) => {
  return createMiddleware(
    async (
      c: Context<{
        Variables: {
          user: Pick<InferSelectModel<typeof User>, 'id' | 'admin' | 'approvedHost'> & UserTokens;
          staffMember: StaffMemberContext;
          tournament: Pick<InferSelectModel<typeof Tournament>, 'hostUserId' | 'id'>;
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
            id: true,
            hostUserId: true,
            concludedAt: true,
            publishedAt: true
          })
        )
        .from(Tournament)
        .where(eq(Tournament.id, +payload.tournamentId))
        .then((rows) => rows[0]);

      if (!tournament) {
        throw new HTTPException(404, {
          message: 'Tournament not found'
        });
      }

      if (tournament.concludedAt || !tournament.publishedAt) {
        throw new HTTPException(403, {
          message: 'Tournament has already concluded or is deleted'
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
            eq(StaffMember.tournamentId, +payload.tournamentId),
            or(isNull(StaffMember.deletedAt), gt(StaffMember.deletedAt, sql`now()`))
          )
        );

      const staffMemberPermissions = new Set(
        staffMember.flatMap((staffMember) => staffMember.staff_role?.permissions ?? [])
      );

      if (
        permissions.length !== 0 &&
        staffMemberPermissions.isDisjointFrom(new Set(permissions)) &&
        tournament.hostUserId !== c.get('user').id
      ) {
        throw new HTTPException(403, {
          message: 'Forbidden'
        });
      }

      c.set('staffMember', {
        ...staffMember[0].staff_member,
        permissions: staffMemberPermissions
      });

      c.set('tournament', {
        id: tournament.id,
        hostUserId: tournament.hostUserId
      });

      await next();
    }
  );
};
