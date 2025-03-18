import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { StaffMemberRole } from '$src/schema';
import { pick } from '$src/utils/query';
import { Service } from '$src/utils/service';
import { tournamentService } from '../tournament/service';
import { staffMemberRepository } from './repository';
import { staffMemberDynamicValidation } from './validation';
import type { DatabaseClient } from '$src/types';
import type { StaffMemberValidationOutput } from './validation';

export class StaffMemberService extends Service {
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
    data: StaffMemberValidationOutput['UpdateStaffMember']
  ) {
    const fn = this.createServiceFunction('Failed to update staff member roles');

    const { userId, tournamentId } = data;

    const existingStaffMember = await staffMemberRepository.getStaffMember(
      db,
      userId,
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

    const staffMemberRoles = await db
      .select(
        pick(StaffMemberRole, {
          staffRoleId: true
        })
      )
      .from(StaffMemberRole)
      .where(eq(StaffMemberRole.staffMemberId, existingStaffMember.id));

    const staffRoles = await fn.validate(
      staffMemberDynamicValidation.updateStaffMemberRoles(staffMemberRoles),
      'staff member roles',
      data
    );

    return await fn.handleDbQuery(
      staffMemberRepository.updateStaffMemberRoles(db, existingStaffMember.id, staffRoles)
    );
  }
}
