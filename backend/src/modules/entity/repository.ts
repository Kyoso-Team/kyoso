import { sql } from 'drizzle-orm';
import type { SQL, Table } from 'drizzle-orm';
import type { DatabaseClient } from '$src/types';

class EntityRepository {
  public async exists(db: DatabaseClient, table: Table, where: SQL | undefined) {
    return await db
      .execute(sql`select exists(select 1 as "exists" from ${table} where ${where})`)
      .then(([{ exists }]) => !!exists);
  }
}

export const entityRepository = new EntityRepository();
