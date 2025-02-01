import type { DatabaseClient } from '$src/types';
import { sql, type SQL, type Table } from 'drizzle-orm';

class EntityRepository {
  public async exists(db: DatabaseClient, table: Table, where: SQL | undefined) {
    return await db
      .execute(sql`select exists(select 1 as "exists" from ${table} where ${where})`)
      .then(([{ exists }]) => !!exists);
  }
}

export const entityRepository = new EntityRepository();
