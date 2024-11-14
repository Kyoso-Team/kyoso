import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { PostgresJsDatabase, PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';

export type DatabaseClient = PostgresJsDatabase | PgTransaction<PostgresJsQueryResultHKT>;
