import { eq, sql } from 'drizzle-orm';
import * as v from 'valibot';
import { DiscordUser, OsuUser, Session, User } from '$src/schema';
import type { DatabaseClient, PickColumns, Simplify } from '$src/types';
import type { SessionValidation } from './validation';
import { pick } from '$src/utils/query';
import type { SessionSelection } from './types';

async function createSession(
  db: DatabaseClient,
  session: v.InferOutput<(typeof SessionValidation)['CreateSession']>
) {
  return db.insert(Session).values({
    expiresAt: sql`now() + interval '3 months'`,
    ...session
  });
}

async function getSession<T extends SessionSelection>(db: DatabaseClient, sessionId: string, select: T): Promise<
  Simplify<
    PickColumns<typeof Session, Exclude<keyof T, 'user'>> & {
    user: T extends { user: object } ? PickColumns<typeof User, Exclude<keyof T['user'], 'osu' | 'discord'>> : never;
    osu: T extends { user: { osu: object } } ? PickColumns<typeof OsuUser, keyof T['user']['osu']> : never;
    discord: T extends { user: { discord: object } } ? PickColumns<typeof DiscordUser, keyof T['user']['discord']> : never;
  }>
> {
  const selection: Record<string, any> = pick(Session, select);

  if (select.user) {
    selection.user = pick(User, select.user);
  }
  if (select.user?.osu) {
    selection.osu = pick(OsuUser, select.user.osu);
  }
  if (select.user?.discord) {
    selection.discord = pick(DiscordUser, select.user.discord);
  }

  const qb = db.select(selection).from(Session).$dynamic().where(eq(Session.id, sessionId));

  if (select.user) {
    qb.innerJoin(User, eq(User.id, Session.userId));
  }
  if (select.user?.osu) {
    qb.innerJoin(OsuUser, eq(OsuUser.userId, User.id));
  }
  if (select.user?.discord) {
    qb.innerJoin(DiscordUser, eq(DiscordUser.userId, User.id));
  }

  return qb.then((rows) => rows.at(0)) as any;
}

async function deleteSession(db: DatabaseClient, sessionId: string) {
  return db.delete(Session).where(eq(Session.id, sessionId));
}

async function resetExpiresAt(db: DatabaseClient, sessionId: string) {
  return db.update(Session).set({ expiresAt: sql`now() + interval '3 months'` }).where(eq(Session.id, sessionId));
}

export const sessionRepository = { createSession, getSession, deleteSession, resetExpiresAt };
