import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import * as v from 'valibot';
import { authMiddleware } from '$src/middlewares/auth.ts';
import { tournamentService } from '$src/modules/tournament/service.ts';
import { TournamentValidation } from '$src/modules/tournament/validation.ts';
import { db } from '$src/singletons';

const tournamentsRouter = new Hono()
  .basePath('/tournaments')
  .post(
    '/',
    authMiddleware,
    vValidator('json', v.omit(TournamentValidation.CreateTournament, ['hostUserId'])),
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

export { tournamentsRouter };
