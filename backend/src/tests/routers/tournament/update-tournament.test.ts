import { beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { eq } from 'drizzle-orm';
import { truncateTable, truncateTables } from '$src/dev';
import { tournamentService } from '$src/modules/tournament/service';
import { userService } from '$src/modules/user/service';
import { Tournament } from '$src/schema';
import { db } from '$src/singletons';
import { expectResponse } from '$src/test';
import { api, loginAs } from '$src/tests';
import { pick } from '$src/utils/query';

describe('patch /tournament/:tournamentId', () => {
  beforeAll(async () => {
    await truncateTables();

    await userService.createDummyUser(db, 1, {
      approvedHost: true
    });
    await userService.createDummyUser(db, 2, {
      approvedHost: true
    });
    await userService.createDummyUser(db, 3, {
      approvedHost: true
    });
  });

  beforeEach(async () => {
    await truncateTable(Tournament);
    await tournamentService.createDummyTournament(db, 1, 1, 'solo');
    await tournamentService.createDummyTournament(db, 2, 3, 'solo');
    await tournamentService.createDummyTournament(db, 3, 1, 'teams', {
      minSize: 2,
      maxSize: 3
    });

    await loginAs(1);
  });

  it("not the tournament's host", async () => {
    await loginAs(2);
    const resp = await api.tournament[':tournamentId'].$patch({
      param: {
        tournamentId: '1'
      },
      json: {
        acronym: 'abc'
      }
    });

    await expectResponse(resp).toEqual(401, 'error');
  });

  it.todo('insufficient staff permissions'); // Implement when staff permissions, roles and mambers are implemented

  it('duplicate name', async () => {
    const resp = await api.tournament[':tournamentId'].$patch({
      param: {
        tournamentId: '1'
      },
      json: {
        name: 'Tournament 2'
      }
    });

    await expectResponse(resp).toEqual(409, 'error');
  });

  it('duplicate url slug', async () => {
    const resp = await api.tournament[':tournamentId'].$patch({
      param: {
        tournamentId: '1'
      },
      json: {
        urlSlug: 't2'
      }
    });

    await expectResponse(resp).toEqual(409, 'error');
  });

  it("can't set a tournament date to a past date", async () => {
    const resp = await api.tournament[':tournamentId'].$patch({
      param: {
        tournamentId: '3'
      },
      json: {
        schedule: {
          tournament: {
            start: new Date('2020-01-01')
          }
        }
      }
    });

    await expectResponse(resp).toEqual(400, 'error');
  });

  it("can't update a tournament date if it's already set and the current date is in the past", async () => {
    await db
      .update(Tournament)
      .set({ publishedAt: new Date('2020-01-01') })
      .where(eq(Tournament.id, 3));
    const resp = await api.tournament[':tournamentId'].$patch({
      param: {
        tournamentId: '3'
      },
      json: {
        schedule: {
          tournament: {
            start: new Date('2050-01-02')
          }
        }
      }
    });

    await expectResponse(resp).toEqual(403, 'error');
  });

  it("can't udpate 'bws', 'lowerRankRange', 'upperRankRange', 'minTeamSize', 'maxTeamSize' or 'useTeamBanners' after tournament's published", async () => {
    await db
      .update(Tournament)
      .set({
        publishedAt: new Date()
      })
      .where(eq(Tournament.id, 3));
    const resp = await api.tournament[':tournamentId'].$patch({
      param: {
        tournamentId: '3'
      },
      json: {
        rankRange: {
          lower: 1000,
          upper: 2000
        }
      }
    });

    await expectResponse(resp).toEqual(403, 'error');
  });

  it("can't update team settings if it's a solo tournament", async () => {
    const resp = await api.tournament[':tournamentId'].$patch({
      param: {
        tournamentId: '1'
      },
      json: {
        teamSize: {
          min: 2,
          max: 4
        }
      }
    });

    await expectResponse(resp).toEqual(403, 'error');
  });

  it("team-based tournament can't unset team settings", async () => {
    const resp = await api.tournament[':tournamentId'].$patch({
      param: {
        tournamentId: '3'
      },
      json: {
        teamSize: null
      }
    });

    await expectResponse(resp).toEqual(403, 'error');
  });

  it('update tournament', async () => {
    const resp = await api.tournament[':tournamentId'].$patch({
      param: {
        tournamentId: '1'
      },
      json: {
        name: 'New Tournament Name'
      }
    });
    const tournaments = await db
      .select(
        pick(Tournament, {
          id: true,
          name: true
        })
      )
      .from(Tournament)
      .where(eq(Tournament.id, 1))
      .limit(1);

    await expectResponse(resp).toEqual(200, 'success');
    expect(tournaments).toEqual([
      {
        id: 1,
        name: 'New Tournament Name'
      }
    ]);
  });

  it('update tournament schedule', async () => {
    const resp = await api.tournament[':tournamentId'].$patch({
      param: {
        tournamentId: '1'
      },
      json: {
        schedule: {
          tournament: {
            start: new Date('2050-01-01'),
            end: new Date('2050-01-04')
          },
          playerRegs: {
            start: new Date('2050-01-02'),
            end: new Date('2050-01-03')
          },
          staffRegs: {
            start: new Date('2050-01-02'),
            end: new Date('2050-01-03')
          }
        }
      }
    });
    const tournaments = await db
      .select(
        pick(Tournament, {
          id: true,
          publishedAt: true,
          concludedAt: true,
          playerRegsOpenedAt: true,
          playerRegsClosedAt: true,
          staffRegsOpenedAt: true,
          staffRegsClosedAt: true
        })
      )
      .from(Tournament)
      .where(eq(Tournament.id, 1))
      .limit(1);

    await expectResponse(resp).toEqual(200, 'success');
    expect(tournaments).toEqual([
      {
        id: 1,
        publishedAt: new Date('2050-01-01'),
        concludedAt: new Date('2050-01-04'),
        playerRegsOpenedAt: new Date('2050-01-02'),
        playerRegsClosedAt: new Date('2050-01-03'),
        staffRegsOpenedAt: new Date('2050-01-02'),
        staffRegsClosedAt: new Date('2050-01-03')
      }
    ]);
  });
});
