import { and, eq, inArray } from 'drizzle-orm';
import { StaffRole } from '$src/schema';
import { pick } from '$src/utils/query';
import type { DatabaseClient, Selection } from '$src/types';
import type { StaffRoleValidationOutput } from './validation';

class StaffRoleRepository {
  public async getStaffRole<T extends Selection<typeof StaffRole>>(
    db: DatabaseClient,
    staffRoleId: number,
    select: T
  ) {
    return db
      .select(pick(StaffRole, select))
      .from(StaffRole)
      .where(eq(StaffRole.id, staffRoleId))
      .then((rows) => rows[0]);
  }

  public async getStaffRoles<T extends Selection<typeof StaffRole>>(
    db: DatabaseClient,
    tournamentId: number,
    staffRoleIds: number[],
    select: T
  ) {
    return db
      .select(pick(StaffRole, select))
      .from(StaffRole)
      .where(and(inArray(StaffRole.id, staffRoleIds), eq(StaffRole.tournamentId, tournamentId)))
      .then((rows) => rows);
  }

  public async createStaffRole(
    db: DatabaseClient,
    staffRole: StaffRoleValidationOutput['CreateStaffRole'],
    order: number
  ) {
    return db
      .insert(StaffRole)
      .values({
        ...staffRole,
        order
      })
      .returning(
        pick(StaffRole, {
          id: true
        })
      )
      .then((rows) => rows[0]);
  }

  public async updateStaffRole(
    db: DatabaseClient,
    staffRoleId: number,
    staffRole: StaffRoleValidationOutput['UpdateStaffRole']
  ) {
    return db.update(StaffRole).set(staffRole).where(eq(StaffRole.id, staffRoleId));
  }

  public async deleteStaffRole<T extends Selection<typeof StaffRole>>(
    db: DatabaseClient,
    staffRoleId: number,
    returning: T
  ) {
    return db
      .delete(StaffRole)
      .where(eq(StaffRole.id, staffRoleId))
      .returning(pick(StaffRole, returning))
      .then((rows) => rows[0]);
  }

  public async getStaffRoleCount(db: DatabaseClient, tournamentId: number) {
    return db.$count(StaffRole, eq(StaffRole.tournamentId, tournamentId));
  }

  public async updateStaffRoleOrder(db: DatabaseClient, staffRoleId: number, order: number) {
    return await db.update(StaffRole).set({ order }).where(eq(StaffRole.id, staffRoleId));
  }
}

export const staffRoleRepository = new StaffRoleRepository();
