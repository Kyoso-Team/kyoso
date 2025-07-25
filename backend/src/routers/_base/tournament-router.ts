import { TournamentService } from '$src/modules/tournament/service';
import { status } from 'elysia';
import { t, type RouterConfig } from './common';
import { createRouter } from './router';
import { StaffMemberService } from '$src/modules/staff-member/service';

export const createTournamentRouter = <TServices extends Record<string, any> = {}>(
  config: RouterConfig<TServices>
) =>
  createRouter({
    ...config,
    prefix: '/tournament/:tournament_id'
  })
  .guard({
    schema: 'standalone',
    params: t.Object({
      tournament_id: t.IntegerId()
    })
  })
  .resolve(async ({ params, requestId, session }) => {
    const tournamentService = new TournamentService('request', requestId);
    const staffMemberService = new StaffMemberService('request', requestId);

    const tournament = await tournamentService.getTournament(params.tournament_id);
    if (!tournament) {
      return status(404, 'Tournament not found');
    }
    
    const staffMember = session ? await staffMemberService.getStaffMember({
      tournamentId: tournament.id,
      userId: session.user.id
    }) : null;
    const isTournamentHost = staffMember && staffMember.userId === tournament.hostUserId;

    return {
      tournament,
      staffMember: {
        ...staffMember,
        host: isTournamentHost
      }
    };
  })
  .macro({
    tournament: (
      v: {
        deleted?: boolean;
        concluded?: boolean;
      }
    ) => ({
      beforeHandle: async ({ tournament }) => {
        const now = new Date().getTime();
        const deleted = tournament && now >= tournament?.deletedAt.getTime();
        const concluded = tournament && now >= tournament?.concludedAt.getTime();

        if (typeof v.deleted === 'boolean' && v.deleted === deleted) {
          return status(410, 'Deleted tournament');
        }

        if (typeof v.concluded === 'boolean' && v.concluded === concluded) {
          return status(410, 'Concluded tournament');
        }
      }
    }),
    staffMember: (
      v:
        | true
        | {
            roles?: string[];
            host?: boolean;
          }
    ) => ({
      resolve: ({ staffMember }) => {
        if (!staffMember) {
          return status(401, 'Not a staff member for this tournament');
        }

        return { staffMember };
      },
      beforeHandle: ({ staffMember }) => {
        if (typeof v !== 'object') return;

        if (v.roles && !staffMember!.permissions.find((permission: string) => v.roles!.includes(permission))) {
          return status(401, `You must have at least one of the following staff permissions: ${v.roles.join(', ')}`);
        }

        if (typeof v.host === 'boolean' && v.host === staffMember!.host) {
          return status(401, 'You must be the tournament host to perform this action');
        }
      }
    })
  });
