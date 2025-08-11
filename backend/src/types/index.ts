import type { StaffPermission } from '$src/schema';
import type { Table } from 'drizzle-orm';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { PostgresJsDatabase, PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import type Redis from 'ioredis';

export type DatabaseClient = PostgresJsDatabase | PgTransaction<PostgresJsQueryResultHKT, any, any>;
export type DatabaseTransactionClient = PgTransaction<PostgresJsQueryResultHKT, any, any>;

export type RedisClient = Redis;

export type Selection<TTable extends Table> = {
  [K in keyof TTable['_']['columns']]?: true;
};

export type Assume<T, U> = T extends U ? T : U;

export type AwaitedReturnType<T> = T extends (...args: any[]) => Promise<infer R> ? R : never;

export type StaffPermission = (typeof StaffPermission.enumValues)[number];