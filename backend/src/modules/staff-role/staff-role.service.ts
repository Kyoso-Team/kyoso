import { and, eq, gt, sql } from 'drizzle-orm';
import { StaffRole } from '$src/schema';
import { ExpectedError, isUniqueConstraintViolationError } from '$src/utils/error';
import { Service } from '$src/utils/service';
import { staffRoleRepository } from './staff-role.repository';
import { db } from '$src/singletons';

//TODO: implement staff member permissions check once implemented
export class StaffRoleService extends Service {
  private static readonly MAX_STAFF_ROLES = 25;

  public async createStaffRole(
    staffRole: Pick<typeof StaffRole.$inferInsert, 'name' | 'tournamentId' | 'color'>
  ) {
    return await this.transaction(db, 'Create staff role', async (tx) => {
      const count = await this.execute(staffRoleRepository.db.countStaffRoles(tx, staffRole.tournamentId));
      if (count >= StaffRoleService.MAX_STAFF_ROLES) {
        throw new ExpectedError(403, `Can't create more than ${StaffRoleService.MAX_STAFF_ROLES} staff roles for a tournament`);
      }

      return await this.execute(
        staffRoleRepository.db.createStaffRole(db, {
          ...staffRole,
          order: count + 1
        }),
        this.handleStaffRoleMutationError(staffRole)
      );
    });
  }

  public async updateStaffRole(
    staffRoleId: number,
    tournamentId: number,
    staffRole: Partial<Pick<typeof StaffRole.$inferInsert, 'name' | 'color' | 'permissions'>>
  ) {
    await this.execute(
      staffRoleRepository.db.updateStaffRole(db, staffRoleId, tournamentId, staffRole),
      this.handleStaffRoleMutationError(staffRole)
    );
  }

  public async swapStaffRoles(staffRoleId1: number, staffRoleId2: number, tournamentId: number) {
    await this.transaction(db, 'Swap staff roles', async (tx) => {
      const staffRoles = await this.execute(
        staffRoleRepository.db.swapStaffRolesOrder(tx, staffRoleId1, staffRoleId2, tournamentId)
      );

      if (staffRoles.length !== 2) {
        tx.rollback();
      }
    }, () => {
      throw new ExpectedError(404, 'One or both staff roles for swapping were not found');
    });
  }

  public async deleteStaffRole(staffRoleId: number, tournamentId: number) {
    await this.transaction(db, 'Delete staff role', async (tx) => {
      const deletedStaffRole = await this.execute(staffRoleRepository.db.deleteStaffRole(tx, staffRoleId, tournamentId));
      if (!deletedStaffRole) return;

      await tx
        .update(StaffRole)
        .set({
          order: sql<number>`${StaffRole.order} - 1`
        })
        .where(
          and(
            gt(StaffRole.order, deletedStaffRole.order),
            eq(StaffRole.tournamentId, tournamentId)
          )
        );
    });
  }

  public async getStaffRoles(tournamentId: number, options?: {
    staffRoleIds?: number[];
  }) {
    return await this.execute(staffRoleRepository.db.getStaffRoles(db, tournamentId, options));
  }

  private handleStaffRoleMutationError(
    staffRole: { name?: string | undefined }
  ) {
    return (err: unknown): never => {
      if (isUniqueConstraintViolationError(err, [StaffRole.name])) {
        throw new ExpectedError(409, `Staff role with name "${staffRole.name}" already exists for this tournament`);
      }

      throw err;
    };
  }
}

