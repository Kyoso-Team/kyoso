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

    const existingStaffRole = await staffRoleRepository.getStaffRole(db, staffRoleId, {
      id: true
    });

    if (!existingStaffRole) {
      throw new HTTPException(404, {
        message: 'Staff role not found'
      });
    }

    await fn.handleDbQuery(staffRoleRepository.updateStaffRole(db, staffRoleId, input));
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
