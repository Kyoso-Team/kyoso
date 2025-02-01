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
    await db.execute('drop extension if exists "pg_trgm" cascade');
    await db.execute('drop schema if exists "public" cascade');
    await db.execute('create schema "public"');
    await db.execute('drop schema if exists "drizzle" cascade');
    await db.execute('create schema "drizzle"');
  }
  
  public async prePushDatabase(db: DatabaseClient) {
    this.checkProd();
    await db.execute('create extension "pg_trgm"');
  }
}

export const databaseRepository = new DatabaseRepository();
