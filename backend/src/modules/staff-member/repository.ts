import { and, eq, gt, inArray, isNotNull, isNull, lt, or, sql } from 'drizzle-orm';
import { StaffMember, StaffMemberRole, StaffRole } from '$src/schema';
import { pick } from '$src/utils/query';
import type { InferSelectModel } from 'drizzle-orm';
import type { StaffPermissions } from '$src/middlewares/permissions';
import type { DatabaseClient, Selection } from '$src/types';
import type { StaffMemberValidationOutput } from './validation';

class StaffMemberRepository {
  public async getStaffMember<T extends Selection<typeof StaffMember>>(
    db: DatabaseClient,
    staffMemberId: number,
    tournamentId: number,
    select: T
  ) {
    return await db
      .select({
        ...pick(StaffMember, select),
        permissions: StaffRole.permissions
      })
      .from(StaffMember)
      .innerJoin(StaffMemberRole, eq(StaffMemberRole.staffMemberId, StaffMember.id))
      .innerJoin(StaffRole, eq(StaffRole.id, StaffMemberRole.staffRoleId))
      .where(
        and(
          eq(StaffMember.id, staffMemberId),
          eq(StaffMember.tournamentId, tournamentId),
          or(isNull(StaffMember.deletedAt), gt(StaffMember.deletedAt, sql`now()`))
        )
      )
      .then((rows) => {
        if (rows.length === 0) {
          return null;
        }
        return {
          ...rows[0],
          //@ts-expect-error -- it doesn't like the select generic
          permissions: (rows.flatMap((row) => row.permissions) ?? []) as StaffPermissions[]
        };
      });
  }

  public async createStaffMember(
    db: DatabaseClient,
    staffMember: StaffMemberValidationOutput['CreateStaffMember']
  ) {
    return db.transaction(async (tx) => {
      const newStaffMember = await tx
        .insert(StaffMember)
        .values(staffMember)
        .onConflictDoUpdate({
          set: {
            deletedAt: null,
            joinedStaffAt: sql`now()`
          },
          target: [StaffMember.userId, StaffMember.tournamentId],
          targetWhere: and(isNotNull(StaffMember.deletedAt), lt(StaffMember.deletedAt, sql`now()`))
        })
        .returning({ id: StaffMember.id })
        .then((rows) => rows[0]);

      const staffMemberRoles = staffMember.staffRoleIds.map<
        InferSelectModel<typeof StaffMemberRole>
      >((staffRoleId) => {
        return {
          staffMemberId: newStaffMember.id,
          staffRoleId
        };
      });

      await db.insert(StaffMemberRole).values(staffMemberRoles);
    });
  }

  public async updateStaffMemberRoles(
    db: DatabaseClient,
    staffMemberId: number,
    staffRoles: {
      add: number[];
      remove: number[];
    }
  ) {
    return db.transaction(async (tx) => {
      if (staffRoles.remove.length !== 0) {
        await tx
          .delete(StaffMemberRole)
          .where(
            and(
              eq(StaffMemberRole.staffMemberId, staffMemberId),
              inArray(StaffMemberRole.staffRoleId, staffRoles.remove)
            )
          );
      }

      if (staffRoles.add.length !== 0) {
        const staffMemberRoles = staffRoles.add.map<InferSelectModel<typeof StaffMemberRole>>(
          (staffRoleId) => {
            return {
              staffMemberId,
              staffRoleId
            };
          }
        );

        await db.insert(StaffMemberRole).values(staffMemberRoles);
      }
    });
  }

  public async deleteStaffMember(db: DatabaseClient, staffMemberId: number) {
    return db.transaction(async (tx) => {
      await tx
        .update(StaffMember)
        .set({
          deletedAt: sql`now()`
        })
        .where(eq(StaffMember.id, staffMemberId));

      await tx.delete(StaffMemberRole).where(eq(StaffMemberRole.staffMemberId, staffMemberId));
    });
  }
}

export const staffMemberRepository = new StaffMemberRepository();
