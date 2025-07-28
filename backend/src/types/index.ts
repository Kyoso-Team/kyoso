import type { StaffPermission } from '$src/schema';
import type { Table } from 'drizzle-orm';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { PostgresJsDatabase, PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import type Redis from 'ioredis';
import type * as v from 'valibot';

export type DatabaseClient = PostgresJsDatabase | PgTransaction<PostgresJsQueryResultHKT, any, any>;
export type DatabaseTransactionClient = PgTransaction<PostgresJsQueryResultHKT, any, any>;

export type RedisClient = Redis;

export type Selection<TTable extends Table> = {
  [K in keyof TTable['_']['columns']]?: true;
};

export type Assume<T, U> = T extends U ? T : U;

export type RemoveNever<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] };

export type Simplify<T> =
  RemoveNever<T> extends infer TNew ? { [K in keyof TNew]: TNew[K] } & {} : never;

export type MapOutput<T> = {
  [K in keyof T]: T[K] extends v.GenericSchema ? v.InferOutput<T[K]> : T[K];
};
export type MapInput<T> = {
  [K in keyof T]: T[K] extends v.GenericSchema ? v.InferInput<T[K]> : T[K];
};

export type StaffPermission = (typeof StaffPermission.enumValues)[number];