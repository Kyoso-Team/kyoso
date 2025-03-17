import { and, isNotNull, lt, sql } from 'drizzle-orm';
import * as v from 'valibot';
import { StaffMember, StaffMemberRole } from '$src/schema';
import type { InferSelectModel } from 'drizzle-orm';
import type { DatabaseClient } from '$src/types';
import type { StaffMemberValidationOutput } from './validation';

class StaffMemberRepository {
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

  public async updateStaffMemberRoles(db: DatabaseClient, input: ) {}
}

export const staffMemberRepository = new StaffMemberRepository();
