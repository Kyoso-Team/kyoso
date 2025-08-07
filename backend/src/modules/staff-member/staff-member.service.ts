import { db } from '$src/singletons/db';
import { Service } from '$src/utils/service';
import { staffMemberRepository } from './staff-member.repository';

export class StaffMemberService extends Service {
  // public async createStaffMember(
  //   db: DatabaseClient,
  //   staffMember: StaffMemberValidationOutput['CreateStaffMember']
  // ) {
  //   const fn = this.createServiceFunction('Failed to create staff member');

  //   const tournamentAvailable = await tournamentService.checkTournamentAvailability(
  //     db,
  //     staffMember.tournamentId
  //   );

  //   if (!tournamentAvailable) {
  //     throw new HTTPException(403, {
  //       message: 'Tournament has already concluded or is deleted'
  //     });
  //   }

  //   return await fn.handleDbQuery(staffMemberRepository.createStaffMember(db, staffMember));
  // }

  public async overrideStaffMemberRoles(
    staffMemberId: number,
    staffRoleIds: number[]
  ) {
    await this.transaction(db, 'Override staff member roles', async (tx) => {
      await this.execute(staffMemberRepository.db.deleteAllStaffMemberRoles(tx, staffMemberId));
      await this.execute(staffMemberRepository.db.createStaffMemberRoles(tx, staffMemberId, staffRoleIds));
    });
  }

  public async deleteStaffMember(staffMemberId: number) {
    await this.execute(staffMemberRepository.db.softDeleteStaffMember(db, staffMemberId));
  }

  public async getStaffMember(by: { staffMemberId: number; tournamentId?: number } | { userId: number; tournamentId: number }) {
    return this.execute(staffMemberRepository.db.getStaffMember(db, by));
  }
}
