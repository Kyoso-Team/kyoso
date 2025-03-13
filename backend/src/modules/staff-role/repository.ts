import { eq } from 'drizzle-orm';
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

  public async getStaffRoleCount(db: DatabaseClient, tournamentId: number) {
    return db.$count(StaffRole, eq(StaffRole.tournamentId, tournamentId));
  }
}

export const staffRoleRepository = new StaffRoleRepository();
