import type { Table } from 'drizzle-orm';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { PostgresJsDatabase, PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import type { ChainableCommander } from 'ioredis';
import type Redis from 'ioredis';

export type DatabaseClient = PostgresJsDatabase | PgTransaction<PostgresJsQueryResultHKT>;

export type RedisClient = Redis | ChainableCommander;

export type Selection<TTable extends Table> = {
  [K in keyof TTable['_']['columns']]?: true;
};

export type Assume<T, U> = T extends U ? T : U;

export type RemoveNever<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] };

export type Simplify<T> =
  RemoveNever<T> extends infer TNew ? { [K in keyof TNew]: TNew[K] } & {} : never;

export type PickColumns<TTable extends Table, TColumns extends string | number | symbol> = Simplify<
  Pick<TTable['$inferSelect'], Assume<TColumns, keyof TTable['$inferSelect']>>
>;

// Meilisearch index types

export type MeilisearchUserIndex = {
  osuUserId: number;
  discordUserId: string; //using string instead of bigint due to serialization issues
  username: string;
  banned: boolean;
};

export type MeilisearchTournamentIndex = {
  id: number;
  name: string;
  acronym: string;
  urlSlug: string;
  publishedAt: Date | null;
  deletedAt: Date | null;
};
