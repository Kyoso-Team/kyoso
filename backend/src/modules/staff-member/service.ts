import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { StaffMemberRole } from '$src/schema';
import { db } from '$src/singletons/db';
import { pick } from '$src/utils/query';
import { Service } from '$src/utils/service';
import { staffRoleRepository } from '../staff-role/repository';
import { tournamentService } from '../tournament/service';
import { staffMemberRepository } from './repository';
import { staffMemberDynamicValidation } from './validation';
import type { StaffMemberContext } from '$src/middlewares/permissions';
import type { DatabaseClient } from '$src/types';
import type { StaffMemberValidationOutput } from './validation';

class StaffMemberService extends Service {
  public async createStaffMember(
    db: DatabaseClient,
    staffMember: StaffMemberValidationOutput['CreateStaffMember']
  ) {
    const fn = this.createServiceFunction('Failed to create staff member');

    const tournamentAvailable = await tournamentService.checkTournamentAvailability(
      db,
      staffMember.tournamentId
    );

    if (!tournamentAvailable) {
      throw new HTTPException(403, {
        message: 'Tournament has already concluded or is deleted'
      });
    }

    return await fn.handleDbQuery(staffMemberRepository.createStaffMember(db, staffMember));
  }

  public async updateStaffMemberRoles(
    db: DatabaseClient,
    sourceStaffMember: StaffMemberContext,
    staffMemberId: number,
    hostUserId: number | null,
    data: StaffMemberValidationOutput['UpdateStaffMember']
  ) {
    const fn = this.createServiceFunction('Failed to update staff member roles');

    const { tournamentId, staffRoleIds } = data;

    if (sourceStaffMember.id === staffMemberId) {
      throw new HTTPException(403, {
        message: 'Cannot update own roles'
      });
    }

    const existingStaffMember = await staffMemberRepository.getStaffMember(
      db,
      staffMemberId,
      tournamentId,
      {
        id: true
      }
    );

    if (!existingStaffMember) {
      throw new HTTPException(404, {
        message: 'Staff member not found'
      });
    }

    if (
      new Set(existingStaffMember.permissions).has('manage_tournament') &&
      sourceStaffMember.userId !== hostUserId
    ) {
      throw new HTTPException(403, {
        message: 'Cannot update roles of staff member with tournament management permissions'
      });
    }

    const staffRoles = await staffRoleRepository.getStaffRoles(db, tournamentId, staffRoleIds, {
      permissions: true
    });

    if (staffRoles.length !== data.staffRoleIds.length) {
      throw new HTTPException(400, {
        message: 'All staff roles must belong to the same tournament'
      });
    }

    if (
      staffRoles.some(
        (staffRole) =>
          new Set(staffRole.permissions).has('manage_tournament') &&
          sourceStaffMember.userId !== hostUserId
      )
    ) {
      throw new HTTPException(403, {
        message: 'Only host can assign tournament management permissions'
      });
    }

    const staffMemberRoles = await db
      .select(
        pick(StaffMemberRole, {
          staffRoleId: true
        })
      )
      .from(StaffMemberRole)
      .where(eq(StaffMemberRole.staffMemberId, existingStaffMember.id));

    const updateStaffRoles = await fn.validate(
      staffMemberDynamicValidation.updateStaffMemberRoles(staffMemberRoles),
      'staff member roles',
      data
    );

    return await fn.handleDbQuery(
      staffMemberRepository.updateStaffMemberRoles(db, existingStaffMember.id, updateStaffRoles)
    );
  }

  public async removeStaffMember(
    sourceStaffMember: StaffMemberContext,
    targetStaffMemberId: number,
    tournamentId: number,
    hostUserId: number | null
  ) {
    if (sourceStaffMember.id === targetStaffMemberId) {
      throw new HTTPException(400, {
        message: 'Cannot remove yourself'
      });
    }

    const fn = this.createServiceFunction('Failed to remove staff member');

    const staffMemberToRemove = await staffMemberRepository.getStaffMember(
      db,
      targetStaffMemberId,
      tournamentId,
      {
        id: true,
        userId: true
      }
    );

    if (!staffMemberToRemove) {
      throw new HTTPException(404, {
        message: 'Staff member not found'
      });
    }

    if (staffMemberToRemove.userId === hostUserId) {
      throw new HTTPException(403, {
        message: 'Tournament host cannot be removed from the tournament'
      });
    }

    if (
      new Set(staffMemberToRemove.permissions).has('manage_tournament') &&
      sourceStaffMember.userId !== hostUserId
    ) {
      throw new HTTPException(403, {
        message: 'Cannot remove staff member with tournament management permissions'
      });
    }
    return await fn.handleDbQuery(
      staffMemberRepository.deleteStaffMember(db, staffMemberToRemove.id)
    );
  }

  public async leaveStaffTeam(userId: number, tournamentId: number, hostUserId: number | null) {
    const fn = this.createServiceFunction('Failed to leave staff team');

    if (hostUserId === userId) {
      throw new HTTPException(403, {
        message: 'Host cannot leave own tournament'
      });
    }

    const staffMember = await staffMemberRepository.getStaffMember(db, userId, tournamentId, {
      id: true
    });

    if (!staffMember) {
      throw new HTTPException(404, {
        message: 'Staff member not found'
      });
    }

    return await fn.handleDbQuery(staffMemberRepository.deleteStaffMember(db, staffMember.id));
  }
}

export const staffMemberService = new StaffMemberService();
