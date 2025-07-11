import { count, eq } from 'drizzle-orm';
import { StaffRole } from '$src/schema';
import { pick } from '$src/utils/query';
import type { DatabaseClient } from '$src/types';
import type { StaffRoleValidationOutput } from './validation';
import { DbRepository } from '$src/modules/_base/repository';

class StaffRoleDbRepository extends DbRepository {
  public getStaffRole(
    db: DatabaseClient,
    staffRoleId: number
  ) {
    const query = db
      .select(pick(StaffRole, {
        id: true,
        name: true,
        order: true,
        tournamentId: true
      }))
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
    staffRole: StaffRoleValidationOutput['CreateStaffRole'],
    order: number
  ) {
    const query = db
      .insert(StaffRole)
      .values({
        ...staffRole,
        order
      })
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
    staffRole: StaffRoleValidationOutput['UpdateStaffRole']
  ) {
    const query = db.update(StaffRole).set(staffRole).where(eq(StaffRole.id, staffRoleId));

    return this.wrap({
      query,
      name: 'Update staff role'
    });
  }

  public deleteStaffRole(
    db: DatabaseClient,
    staffRoleId: number
  ) {
    const query = db
      .delete(StaffRole)
      .where(eq(StaffRole.id, staffRoleId))
      .returning(pick(StaffRole, {
        id: true,
        order: true
      }));

    return this.wrap({
      query,
      name: 'Delete staff role',
      map: this.map.firstRowOrNull
    });
  }

  public countStaffRoles(db: DatabaseClient, tournamentId: number) {
    const query = db.select({ count: count(StaffRole.id).as('count') }).from(StaffRole).where(eq(StaffRole.tournamentId, tournamentId));

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
