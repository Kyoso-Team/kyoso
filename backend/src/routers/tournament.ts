import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import { sessionMiddleware } from '$src/middlewares/session';
import { tournamentService } from '$src/modules/tournament/service.ts';
import { TournamentValidation } from '$src/modules/tournament/validation.ts';
import { db } from '$src/singletons';
import * as s from '$src/utils/validation';

const tournamentRouter = new Hono().basePath('/tournament').post(
  '/',
  sessionMiddleware({
    approvedHost: true
  }),
  vValidator('json', s.omitPiped(TournamentValidation.CreateTournament, ['hostUserId'])),
  async (c) => {
    const body = c.req.valid('json');
    const result = await tournamentService.createTournament(db, {
      ...body,
      hostUserId: c.get('user').id
    });

    return c.json({
      id: result.id
    });
  }
);

export { tournamentRouter };
