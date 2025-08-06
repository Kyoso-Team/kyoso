import { TournamentService } from '$src/modules/tournament/tournament.service';
import { status } from 'elysia';
import { t, type RouterConfig } from './common';
import { createRouter } from './router';
import { StaffMemberService } from '$src/modules/staff-member/service';
import type { StaffPermission } from '$src/types';

export const createTournamentRouter = (config?: RouterConfig) =>
  createRouter({
    ...config,
    prefix: '/tournament/:tournament_id'
  })
  .guard({
    schema: 'standalone',
    params: t.Object({
      tournament_id: t.IntegerIdString()
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
    const isTournamentHost = !!staffMember && staffMember.userId === tournament.hostUserId;

    return {
      tournament,
      staffMember: staffMember ? {
        ...staffMember,
        host: isTournamentHost
      } : null
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
        const deleted = tournament?.deletedAt && now >= tournament.deletedAt.getTime();
        const concluded = tournament?.concludedAt && now >= tournament.concludedAt.getTime();

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
            permissions?: StaffPermission[];
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

        if (
          v.permissions && (!staffMember!.permissions.find((permission: StaffPermission) => v.permissions!.includes(permission)) || !staffMember!.host)
        ) {
          return status(401, `You must be the tournament host or have at least one of the following staff permissions: ${v.permissions.join(', ')}`);
        }
      }
    })
  });
