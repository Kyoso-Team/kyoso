import { and, eq, gt, isNull, or, sql } from 'drizzle-orm';
import { StaffMember, StaffMemberRole, StaffRole } from '$src/schema';
import { pick } from '$src/utils/query';
import { DbRepository } from '../_base/db-repository';
import type { DatabaseClient } from '$src/types';

class StaffMemberDbRepository extends DbRepository {
  public getStaffMember(db: DatabaseClient, by: { staffMemberId: number; tournamentId?: number } | { userId: number; tournamentId: number }) {
    const query = db
      .select({
        ...pick(StaffMember, {
          id: true,
          userId: true
        }),
        permissions: sql<
          typeof StaffRole.$inferSelect.permissions
        >`array_agg(distinct unnest(${StaffRole.permissions}))`.as('permissions')
      })
      .from(StaffMember)
      .leftJoin(StaffMemberRole, eq(StaffMemberRole.staffMemberId, StaffMember.id))
      .leftJoin(StaffRole, eq(StaffRole.id, StaffMemberRole.staffRoleId))
      .where(
        and(
          ...('staffMemberId' in by
            ? [
              eq(StaffMember.id, by.staffMemberId),
              by.tournamentId ? eq(StaffMember.tournamentId, by.tournamentId) : undefined
            ]
            : [
              eq(StaffMember.userId, by.userId),
              eq(StaffMember.tournamentId, by.tournamentId)
            ]
          ),
          or(isNull(StaffMember.deletedAt), gt(StaffMember.deletedAt, sql`now()`))
        )
      )
      .groupBy(StaffMember.id, StaffMember.userId)
      .limit(1);

    return this.wrap({
      query,
      name: 'Get staff member',
      map: this.map.firstRowOrNull
    });
  }

  // Will rewrite later - Mario564
  // public createStaffMember(
  //   db: DatabaseClient,
  //   staffMember: StaffMemberValidationOutput['CreateStaffMember']
  // ) {
  //   return db.transaction(async (tx) => {
  //     const newStaffMember = await tx
  //       .insert(StaffMember)
  //       .values(staffMember)
  //       .onConflictDoUpdate({
  //         set: {
  //           deletedAt: null,
  //           joinedStaffAt: sql`now()`
  //         },
  //         target: [StaffMember.userId, StaffMember.tournamentId],
  //         targetWhere: and(isNotNull(StaffMember.deletedAt), lt(StaffMember.deletedAt, sql`now()`))
  //       })
  //       .returning({ id: StaffMember.id })
  //       .then((rows) => rows[0]);

  //     const staffMemberRoles = staffMember.staffRoleIds.map<
  //       InferSelectModel<typeof StaffMemberRole>
  //     >((staffRoleId) => {
  //       return {
  //         staffMemberId: newStaffMember.id,
  //         staffRoleId
  //       };
  //     });

  //     await db.insert(StaffMemberRole).values(staffMemberRoles);
  //   });
  // }

  // public async updateStaffMemberRoles(
  //   db: DatabaseClient,
  //   staffMemberId: number,
  //   staffRoles: {
  //     add: number[];
  //     remove: number[];
  //   }
  // ) {
  //   return db.transaction(async (tx) => {
  //     if (staffRoles.remove.length !== 0) {
  //       await tx
  //         .delete(StaffMemberRole)
  //         .where(
  //           and(
  //             eq(StaffMemberRole.staffMemberId, staffMemberId),
  //             inArray(StaffMemberRole.staffRoleId, staffRoles.remove)
  //           )
  //         );
  //     }

  //     if (staffRoles.add.length !== 0) {
  //       const staffMemberRoles = staffRoles.add.map<InferSelectModel<typeof StaffMemberRole>>(
  //         (staffRoleId) => {
  //           return {
  //             staffMemberId,
  //             staffRoleId
  //           };
  //         }
  //       );

  //       await db.insert(StaffMemberRole).values(staffMemberRoles);
  //     }
  //   });
  // }

  public createStaffMemberRoles(db: DatabaseClient, staffMemberId: number, staffRoleIds: number[]) {
    const query = db
      .insert(StaffMemberRole)
      .values(
        staffRoleIds.map((staffRoleId) => ({
          staffMemberId,
          staffRoleId
        }))
      )
      .onConflictDoNothing({
        target: [StaffMemberRole.staffMemberId, StaffMemberRole.staffRoleId]
      });

    return this.wrap({
      query,
      name: 'Create staff member roles'
    });
  }

  public deleteAllStaffMemberRoles(db: DatabaseClient, staffMemberId: number) {
    const query = db
      .delete(StaffMemberRole)
      .where(eq(StaffMemberRole.staffMemberId, staffMemberId));

    return this.wrap({
      query,
      name: 'Delete all staff member roles'
    });
  }

  public softDeleteStaffMember(db: DatabaseClient, staffMemberId: number) {
    const query = db
      .update(StaffMember)
      .set({
        deletedAt: sql`now()`
      })
      .where(eq(StaffMember.id, staffMemberId));

    return this.wrap({
      query,
      name: 'Soft delete staff member'
    });
  }
}

class StaffMemberRepository {
  public db = new StaffMemberDbRepository();
}

export const staffMemberRepository = new StaffMemberRepository();
