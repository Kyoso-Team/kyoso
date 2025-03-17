import { and, eq, gt, sql } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { StaffRole } from '$src/schema';
import { isUniqueConstraintViolationError, unknownError } from '$src/utils/error';
import { Service } from '$src/utils/service';
import { tournamentService } from '../tournament/service';
import { staffRoleRepository } from './repository';
import type { DatabaseClient } from '$src/types';
import type { StaffRoleValidationOutput } from './validation';

//TODO: implement staff member permissions check once implemented
class StaffRoleService extends Service {
  private MAX_STAFF_ROLES = 25;

  public async createStaffRole(
    db: DatabaseClient,
    input: StaffRoleValidationOutput['CreateStaffRole']
  ) {
    const fn = this.createServiceFunction('Failed to create staff role');
    const tournamentAvailable = await tournamentService.checkTournamentAvailability(
      db,
      input.tournamentId
    );

    if (!tournamentAvailable) {
      throw new HTTPException(403, {
        message: 'Tournament has already concluded or is deleted'
      });
    }

    const staffRolesCount = await staffRoleRepository.getStaffRoleCount(db, input.tournamentId);

    if (staffRolesCount >= this.MAX_STAFF_ROLES) {
      throw new HTTPException(403, {
        message: "Can't have more than 25 staff roles per tournament"
      });
    }

    return await fn.handleDbQuery(
      staffRoleRepository.createStaffRole(db, input, staffRolesCount + 1),
      this.handleStaffRoleCreationError(input.name, fn.errorMessage)
    );
  }

  public async updateStaffRole(
    db: DatabaseClient,
    input: StaffRoleValidationOutput['UpdateStaffRole'],
    staffRoleId: number
  ) {
    const fn = this.createServiceFunction('Failed to update staff role');

    const existingStaffRole = await staffRoleRepository.getStaffRole(
      db,
      staffRoleId,
      input.tournamentId,
      {
        id: true
      }
    );

    if (!existingStaffRole) {
      throw new HTTPException(404, {
        message: 'Staff role not found'
      });
    }

    await fn.handleDbQuery(
      staffRoleRepository.updateStaffRole(db, staffRoleId, input),
      input.name ? this.handleStaffRoleCreationError(input.name, fn.errorMessage) : undefined
    );
  }

  public async swapStaffRoles(
    db: DatabaseClient,
    input: StaffRoleValidationOutput['SwapStaffRoles'],
    sourceStaffRoleId: number
  ) {
    const fn = this.createServiceFunction('Failed to swap staff roles');

    const { tournamentId, targetStaffRoleId } = input;

    const tournamentAvailable = await tournamentService.checkTournamentAvailability(
      db,
      tournamentId
    );

    if (!tournamentAvailable) {
      throw new HTTPException(403, {
        message: 'Tournament has already concluded or is deleted'
      });
    }

    const [sourceStaffRole, targetStaffRole] = await Promise.all([
      staffRoleRepository.getStaffRole(db, sourceStaffRoleId, tournamentId, {
        id: true,
        order: true,
        tournamentId: true
      }),
      staffRoleRepository.getStaffRole(db, targetStaffRoleId, tournamentId, {
        id: true,
        order: true,
        tournamentId: true
      })
    ]);

    if (!sourceStaffRole || !targetStaffRole) {
      throw new HTTPException(404, {
        message: 'Staff role not found'
      });
    }

    if (sourceStaffRole.tournamentId !== targetStaffRole.tournamentId) {
      throw new HTTPException(403, {
        message: 'Staff roles must belong in the same tournament'
      });
    }

    await fn.handleDbQuery(
      db.transaction(async (tx) => {
        await staffRoleRepository.updateStaffRoleOrder(
          tx,
          sourceStaffRole.id,
          targetStaffRole.order
        );
        await staffRoleRepository.updateStaffRoleOrder(
          tx,
          targetStaffRole.id,
          sourceStaffRole.order
        );
      })
    );
  }

  public async deleteStaffRole(db: DatabaseClient, staffRoleId: number, tournamentId: number) {
    const fn = this.createServiceFunction('Failed to delete staff role');

    const existingStaffRole = await staffRoleRepository.getStaffRole(
      db,
      staffRoleId,
      tournamentId,
      {
        order: true,
        tournamentId: true
      }
    );

    if (!existingStaffRole) {
      throw new HTTPException(404, {
        message: 'Staff role not found'
      });
    }

    await fn.handleDbQuery(
      db.transaction(async (tx) => {
        const deletedStaffRole = await staffRoleRepository.deleteStaffRole(tx, staffRoleId, {
          order: true
        });

        await tx
          .update(StaffRole)
          .set({
            order: sql<number>`${StaffRole.order} - 1`
          })
          .where(
            and(
              eq(StaffRole.tournamentId, existingStaffRole.tournamentId),
              gt(StaffRole.order, deletedStaffRole.order)
            )
          );
      })
    );
  }

  private handleStaffRoleCreationError(staffRoleName: string, descriptionIfUnknownError: string) {
    return (err: unknown): never => {
      if (isUniqueConstraintViolationError(err, [StaffRole.name])) {
        throw new HTTPException(409, {
          message: `Staff role '${staffRoleName}' already exists for this tournament`
        });
      }

      unknownError(descriptionIfUnknownError)(err);
      return undefined as never;
    };
  }
}

export const staffRoleService = new StaffRoleService();
