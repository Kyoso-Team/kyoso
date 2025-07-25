import { eq, sql } from 'drizzle-orm';
import { DiscordUser, OsuUser, Session, User } from '$src/schema';
import { pick } from '$src/utils/query';
import { DbRepository } from '../_base/db-repository';
import type { DatabaseClient } from '$src/types';

class SessionDbRepository extends DbRepository {
  public createSession(
    db: DatabaseClient,
    session: Pick<
      typeof Session.$inferInsert,
      'id' | 'userAgent' | 'ipAddress' | 'ipMetadata' | 'userId'
    >
  ) {
    const query = db.insert(Session).values({
      expiresAt: sql`now() + interval '3 months'`,
      ...session
    });

    return this.wrap({
      query,
      name: 'Create session'
    });
  }

  public getSession(db: DatabaseClient, sessionId: string) {
    const query = db
      .select({
        ...pick(Session, {
          id: true,
          expiresAt: true
        }),
        user: pick(User, {
          id: true,
          admin: true,
          approvedHost: true,
          banned: true
        }),
        osu: pick(OsuUser, {
          osuUserId: true,
          token: true,
          username: true,
          updatedAt: true
        }),
        discord: pick(DiscordUser, {
          discordUserId: true,
          token: true,
          username: true,
          updatedAt: true
        })
      })
      .from(Session)
      .innerJoin(User, eq(User.id, Session.userId))
      .innerJoin(OsuUser, eq(OsuUser.userId, User.id))
      .innerJoin(DiscordUser, eq(DiscordUser.userId, User.id))
      .where(eq(Session.id, sessionId))
      .limit(1);

    return this.wrap({
      query,
      name: 'Get session',
      map: this.map.firstRowOrNull
    });
  }

  public deleteSession(db: DatabaseClient, sessionId: string) {
    const query = db.delete(Session).where(eq(Session.id, sessionId));

    return this.wrap({
      query,
      name: 'Delete session'
    });
  }

  public resetExpiration(db: DatabaseClient, sessionId: string) {
    const query = db
      .update(Session)
      .set({ expiresAt: sql`now() + interval '3 months'`, lastActiveAt: sql`now()` })
      .where(eq(Session.id, sessionId));

    return this.wrap({
      query,
      name: 'Reset session expiration date'
    });
  }
}

class SessionRepository {
  public db = new SessionDbRepository();
}

export const sessionRepository = new SessionRepository();
