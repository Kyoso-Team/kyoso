import { sql } from 'drizzle-orm';
import { Country, OsuBadge, Tournament, User } from '$src/schema';
import { env } from '$src/utils/env';
import type { DatabaseClient } from '$src/types';

class DatabaseRepository {
  private checkProd() {
    if (env.NODE_ENV === 'production') {
      throw new Error('Operation not allowed in production');
    }
  }

  public async resetDatabase(db: DatabaseClient) {
    this.checkProd();
    //await db.execute('drop extension if exists "pg_trgm" cascade');
    await db.execute('drop schema if exists "public" cascade');
    await db.execute('create schema "public"');
    await db.execute('drop schema if exists "drizzle" cascade');
    await db.execute('create schema "drizzle"');
  }

  public async prePushDatabase(_db: DatabaseClient) {
    this.checkProd();
    //await db.execute('create extension "pg_trgm"');
  }

  public async truncateTables(db: DatabaseClient) {
    this.checkProd();
    const tables = [User, Country, OsuBadge, Tournament];
    for (const table of tables) {
      await db.execute(sql`truncate table ${table} restart identity cascade`);
    }
  }
}

export const databaseRepository = new DatabaseRepository();
