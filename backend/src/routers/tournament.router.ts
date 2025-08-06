import { TournamentService } from '$src/modules/tournament/tournament.service';
import { createRouter } from './_base/router';
import Elysia, { status } from 'elysia';
import { initServices, t } from './_base/common';
import { createTournamentRouter } from './_base/tournament-router';
import { time } from '$src/utils';
import { UserService } from '$src/modules/user/user.service';

const services = initServices({
  tournamentService: TournamentService,
  userService: UserService
});

const BaseTournamentType = t.Object({
  name: t.String({ minLength: 2, maxLength: 50 }),
  urlSlug: t.String({ minLength: 2, maxLength: 16 }),
  acronym: t.String({ minLength: 2, maxLength: 8 }),
  description: t.Optional(t.String()),
  rankRange: t.Optional(
    t.Nullable(
      t.Object({
        lower: t.Integer({ minimum: 1 }),
        upper: t.Optional(t.Integer({ minimum: 1 }))
      })
    )
  ),
  teamSize: t.Optional(
    t.Nullable(
      t.Object({
        min: t.Integer({ minimum: 2, maximum: 16 }),
        max: t.Optional(t.Integer({ minimum: 2, maximum: 16 }))
      })
    )
  )
});

const tournamentRouter1 = createRouter({
  prefix: '/tournament'
})
  .use(services)
  .post('/', async ({ body, tournamentService }) => {
    return await tournamentService.createTournament(body);
  }, {
    body: t.Object({
      ...BaseTournamentType.properties,
      isOpenRank: t.Boolean(),
      type: t.Union([t.Literal('solo'), t.Literal('teams'), t.Literal('draft')])
    }),
    session: {
      approvedHost: true
    },
    beforeHandle: async ({ body }) => {
      if (body.isOpenRank && (!body.rankRange || Object.values(body.rankRange).every((val) => val === null))) {
        return status(422, 'Can\'t set rank range for an open rank tournament');
      }

      if (body.type === 'solo' && body.teamSize !== undefined) {
        return status(422, 'Can\'t set team settings for a solo tournament');
      }

      if (body.type !== 'solo' && (body.teamSize === undefined || body.teamSize === null)) {
        return status(422, 'Must set team settings for a team-based tournament');
      }
    }
  });

const tournamentRouter2 = createTournamentRouter()
  .use(services)
  .patch('/', async ({ params, body, tournamentService }) => {
    return await tournamentService.updateTournament(params.tournament_id, {
      ...body,
      pickTimerLength: body.timers?.pick,
      banTimerLength: body.timers?.ban,
      protectTimerLength: body.timers?.protect,
      readyTimerLength: body.timers?.ready,
      startTimerLength: body.timers?.start,
      allowDoublePick: body.options?.doublePick,
      allowDoubleBan: body.options?.doubleBan,
      allowDoubleProtect: body.options?.doubleProtect,
      banAndProtectCancelOut: body.options?.banAndProtectCancelOut,
      forceNoFail: body.options?.forceNoFail,
      pickOrder: body.orders?.pick,
      banOrder: body.orders?.ban,
      protectOrder: body.orders?.protect,
      publishedAt: body.schedule?.tournament?.start ? new Date(body.schedule.tournament.start) : null,
      concludedAt: body.schedule?.tournament?.end ? new Date(body.schedule.tournament.end) : null,
      playerRegsOpenedAt: body.schedule?.playerRegs?.start ? new Date(body.schedule.playerRegs.start) : null,
      playerRegsClosedAt: body.schedule?.playerRegs?.end ? new Date(body.schedule.playerRegs.end) : null,
      staffRegsOpenedAt: body.schedule?.staffRegs?.start ? new Date(body.schedule.staffRegs.start) : null,
      staffRegsClosedAt: body.schedule?.staffRegs?.end ? new Date(body.schedule.staffRegs.end) : null
    });
  }, {
    body: t.Partial(
      t.Object({
        ...BaseTournamentType.properties,
        useTeamBanners: t.Boolean(),
        winCondition: t.Union([t.Literal('score'), t.Literal('accuracy'), t.Literal('combo')]),
        bws: t.Nullable(
          t.Record(
            t.Union([t.Literal('x'), t.Literal('y'), t.Literal('z')]),
            t.Number({ minimum: -10, maximum: 10 })
          )
        ),
        timers: t.Partial(
          t.Record(
            t.Union([
              t.Literal('pick'),
              t.Literal('ban'),
              t.Literal('protect'),
              t.Literal('ready'),
              t.Literal('start')
            ]),
            t.Integer({ minimum: 0, maximum: time.minutes(15) })
          )
        ),
        options: t.Partial(
          t.Record(
            t.Union([
              t.Literal('doublePick'),
              t.Literal('doubleBan'),
              t.Literal('doubleProtect'),
              t.Literal('banAndProtectCancelOut'),
              t.Literal('forceNoFail')
            ]),
            t.Boolean()
          )
        ),
        orders: t.Partial(
          t.Record(
            t.Union([t.Literal('pick'), t.Literal('ban'), t.Literal('protect')]),
            t.Union([t.Literal('linear'), t.Literal('snake')])
          )
        ),
        schedule: t.Record(
          t.Union([t.Literal('tournament'), t.Literal('playerRegs'), t.Literal('staffRegs')]),
          t.Partial(
            t.Record(
              t.Union([t.Literal('start'), t.Literal('end')]),
              t.DateString()
            )
          )
        )
      })
    ),
    nonEmptyBody: true,
    session: true,
    staffMember: {
      permissions: ['manage_tournament']
    },
    tournament: {
      deleted: false,
      concluded: false
    },
    beforeHandle: async ({ body, tournament, staffMember }) => {
      const now = new Date().getTime();

      if (tournament.type === 'solo' && (body.teamSize !== undefined || body.useTeamBanners !== undefined)) {
        return status(422, 'Can\'t set team settings for a solo tournament');
      }

      if (tournament.type !== 'solo' && (body.teamSize === undefined || body.teamSize === null)) {
        return status(422, 'Must set team settings for a team-based tournament');
      }

      if (body.bws && (body.bws.x === 0 || body.bws.y === 0 || body.bws.z === 0)) {
        return status(422, 'None of the BWS constants can be zero');
      }

      if (body.schedule) {
        for (const [key, value] of Object.entries(body.schedule)) {
          const start = value.start ? new Date(value.start).getTime() : null;
          const end = value.end ? new Date(value.end).getTime() : null;

          if (end && !start) {
            return status(422, `Invalid date range for schedule property "${key}": Expected the start date to be set if the end date is set`);
          }

          if (end && start && start > end) {
            return status(422, `Invalid date range for schedule property "${key}": Expected the start date to be before the end date`);
          }

          if ((start && start < now) || (end && end < now)) {
            return status(422, `Invalid date range for schedule property "${key}": Expected all dates to be in the future`);
          }
        }

        if ((body.schedule.playerRegs || body.schedule.staffRegs) && !body.schedule.tournament?.start) {
          return status(422, 'Invalid date range: Expected the tournament publish date to be set if player or staff registration dates are also set');
        }

        if (body.schedule.tournament?.end && (!body.schedule.playerRegs || !body.schedule.staffRegs)) {
          return status(422, 'Invalid date range: Expected the tournament player and staff registration dates to be set if the conclusion date is also set');
        }
      }

      const propsToUpdate = new Set(Object.keys(body) as (keyof typeof body)[]);
      const hostOnlyProps = new Set<keyof typeof body>([
        'name',
        'urlSlug',
        'acronym',
        'description',
        'teamSize',
        'useTeamBanners',
        'rankRange',
        'bws'
      ]);
      const hasHostOnlyProps = propsToUpdate.intersection(hostOnlyProps).size !== 0;

      if (hasHostOnlyProps && !staffMember.host) {
        return status(401, `You must be the tournament host to update the following properties: "${
          Array.from(hostOnlyProps).join('", "')
        }"`);
      }

      const published = (tournament.publishedAt && now > tournament.publishedAt.getTime()) ||
        (body.schedule?.tournament.start && now > new Date(body.schedule.tournament.start).getTime());
      const prePublishOnlyProps = new Set<keyof typeof body>(['teamSize', 'useTeamBanners', 'rankRange', 'bws']);
      const hasPrePublishOnlyProps = propsToUpdate.intersection(prePublishOnlyProps).size !== 0;

      if (published && hasPrePublishOnlyProps) {
        return status(403, `Can't update the following fields after tournament is published: "${
          Array.from(prePublishOnlyProps).join('", "')
        }"`);
      }

      if (
        (tournament.publishedAt && now > tournament.publishedAt.getTime() && body.schedule?.tournament.start) ||
        (tournament.concludedAt && now > tournament.concludedAt.getTime() && body.schedule?.tournament.end) ||
        (tournament.playerRegsOpenedAt && now > tournament.playerRegsOpenedAt.getTime() && body.schedule?.playerRegs?.start) ||
        (tournament.playerRegsClosedAt && now > tournament.playerRegsClosedAt.getTime() && body.schedule?.playerRegs?.end) ||
        (tournament.staffRegsOpenedAt && now > tournament.staffRegsOpenedAt.getTime() && body.schedule?.staffRegs?.start) ||
        (tournament.staffRegsClosedAt && now > tournament.staffRegsClosedAt.getTime() && body.schedule?.staffRegs?.end)
      ) {
        return status(403, 'Can\'t update tournament dates that are already set in the past');
      }
    }
  })
  .patch('/delegate-host', async ({ params, body, staffMember, userService, tournamentService }) => {
    const newHost = await userService.getUser(body.newHostUserId);

    if (staffMember.userId === body.newHostUserId) {
      return status(403, 'You\'re already the host of this tournament');
    }

    if (!newHost) {
      return status(404, 'New host user not found');
    }

    if (newHost.banned) {
      return status(400, 'Can\'t delegate host to a banned user');
    }

    if (!newHost.approvedHost) {
      return status(400, 'Can\'t delegate host to a non-approved host');
    }

    await tournamentService.updateTournament(params.tournament_id, {
      hostUserId: body.newHostUserId
    });
  }, {
    body: t.Object({
      newHostUserId: t.IntegerId()
    }),
    session: true,
    staffMember: {
      permissions: []
    },
    tournament: {
      deleted: false,
      concluded: false
    }
  })
  .delete('/', async ({ params, query, tournamentService }) => {
    await tournamentService.deleteTournament(params.tournament_id, query.hard_delete);
  }, {
    query: t.Object({
      hard_delete: t.Optional(t.BooleanString())
    }),
    session: true,
    staffMember: {
      permissions: []
    },
    tournament: {
      concluded: false
    }
  });

export const tournamentRouter = new Elysia().use(tournamentRouter1).use(tournamentRouter2);
