import { and, count, eq, or, sql } from 'drizzle-orm';
import { DbRepository } from '$src/modules/_base/repository';
import { StaffRole } from '$src/schema';
import { pick } from '$src/utils/query';
import type { DatabaseClient } from '$src/types';

class StaffRoleDbRepository extends DbRepository {
  public getStaffRole(db: DatabaseClient, staffRoleId: number) {
    const query = db
      .select(
        pick(StaffRole, {
          id: true,
          name: true,
          order: true,
          tournamentId: true
        })
      )
      .from(StaffRole)
      .where(eq(StaffRole.id, staffRoleId));

    return this.wrap({
      query,
      name: 'Get staff role',
      map: this.map.firstRowOrNull
    });
  }

  public createStaffRole(
    db: DatabaseClient,
    staffRole: Pick<typeof StaffRole.$inferInsert, 'name' | 'tournamentId' | 'color' | 'order'>
  ) {
    const query = db
      .insert(StaffRole)
      .values(staffRole)
      .returning(
        pick(StaffRole, {
          id: true
        })
      );

    return this.wrap({
      query,
      name: 'Create staff role',
      map: this.map.firstRow
    });
  }

  public updateStaffRole(
    db: DatabaseClient,
    staffRoleId: number,
    tournamentId: number,
    staffRole: Partial<Pick<typeof StaffRole.$inferInsert, 'name' | 'color' | 'permissions'>>
  ) {
    const query = db.update(StaffRole).set(staffRole).where(and(
      eq(StaffRole.id, staffRoleId),
      eq(StaffRole.tournamentId, tournamentId)
    ));

    return this.wrap({
      query,
      name: 'Update staff role'
    });
  }

  public swapStaffRolesOrder(
    db: DatabaseClient,
    staffRoleId1: number,
    staffRoleId2: number,
    tournamentId: number
  ) {
    const sq1 = db.$with('staff_role_1_sq').as(
      db
        .select({ order: StaffRole.order })
        .from(StaffRole)
        .where(eq(StaffRole.id, staffRoleId1))
    );
    const sq2 = db.$with('staff_role_2_sq').as(
      db
        .select({ order: StaffRole.order })
        .from(StaffRole)
        .where(eq(StaffRole.id, staffRoleId2))
    );
    const query = db
      .with(sq1, sq2)
      .update(StaffRole)
      .set({
        order: sql`case when ${StaffRole.id} = ${staffRoleId1} then ${sq1.order} when ${StaffRole.id} = ${staffRoleId2} then ${sq2.order} else ${StaffRole.order} end`
      })
      .from(sq1)
      .innerJoin(sq2, sql`true`)
      .where(and(
        eq(StaffRole.tournamentId, tournamentId),
        or(
          eq(StaffRole.id, staffRoleId1),
          eq(StaffRole.id, staffRoleId2)
        )
      ))
      .returning(
        pick(StaffRole, {
          id: true
        })
      );

    return this.wrap({
      query,
      name: 'Swap staff roles order'
    });
  }

  public deleteStaffRole(db: DatabaseClient, staffRoleId: number, tournamentId: number) {
    const query = db
      .delete(StaffRole)
      .where(and(
        eq(StaffRole.id, staffRoleId),
        eq(StaffRole.tournamentId, tournamentId)
      ))
      .returning(
        pick(StaffRole, {
          id: true,
          order: true
        })
      );

    return this.wrap({
      query,
      name: 'Delete staff role',
      map: this.map.firstRowOrNull
    });
  }

  public countStaffRoles(db: DatabaseClient, tournamentId: number) {
    const query = db
      .select({ count: count(StaffRole.id).as('count') })
      .from(StaffRole)
      .where(eq(StaffRole.tournamentId, tournamentId));

    return this.wrap({
      query,
      name: 'Count staff roles',
      map: this.map.countRows
    });
  }
}

class StaffRoleRepository {
  public db = new StaffRoleDbRepository();
}

export const staffRoleRepository = new StaffRoleRepository();
