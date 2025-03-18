import { and, eq, inArray, isNotNull, lt, sql } from 'drizzle-orm';
import { StaffMember, StaffMemberRole } from '$src/schema';
import { pick } from '$src/utils/query';
import type { InferSelectModel } from 'drizzle-orm';
import type { DatabaseClient, Selection } from '$src/types';
import type { StaffMemberValidationOutput } from './validation';

class StaffMemberRepository {
  public async getStaffMember<T extends Selection<typeof StaffMember>>(
    db: DatabaseClient,
    userId: number,
    tournamentId: number,
    select: T
  ) {
    return db
      .select(pick(StaffMember, select))
      .from(StaffMember)
      .where(
        and(
          eq(StaffMember.userId, userId),
          eq(StaffMember.tournamentId, tournamentId),
          isNotNull(StaffMember.deletedAt),
          lt(StaffMember.deletedAt, sql`now()`)
        )
      )
      .then((rows) => rows[0]);
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
      await tx
        .delete(StaffMemberRole)
        .where(
          and(
            eq(StaffMemberRole.staffMemberId, staffMemberId),
            inArray(StaffMemberRole.staffRoleId, staffRoles.remove)
          )
        );

      const staffMemberRoles = staffRoles.add.map<InferSelectModel<typeof StaffMemberRole>>(
        (staffRoleId) => {
          return {
            staffMemberId,
            staffRoleId
          };
        }
      );

      await db.insert(StaffMemberRole).values(staffMemberRoles);
    });
  }
}

export const staffMemberRepository = new StaffMemberRepository();
