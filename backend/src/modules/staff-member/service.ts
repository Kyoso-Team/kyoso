import { HTTPException } from 'hono/http-exception';
import * as v from 'valibot';
import { Service } from '$src/utils/service';
import { tournamentService } from '../tournament/service';
import { staffMemberRepository } from './repository';
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
  }
}
