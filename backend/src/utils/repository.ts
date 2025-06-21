import { env } from './env';
import type { RunnableQuery } from 'drizzle-orm/runnable-query';
import { sql, type Query, type QueryPromise, type SQL, type Table } from 'drizzle-orm';
import type { ChainableCommander } from 'ioredis';
import { redis } from '$src/singletons';
import type { DatabaseClient } from '$src/types';

interface BaseQueryMeta {
  name: string;
}

interface DbQueryMeta extends BaseQueryMeta {
  queryType: 'db';
  query: string;
  params: any[];
}

interface KvQueryMeta extends BaseQueryMeta {
  queryType: 'kv';
  method: 'get' | 'set' | 'delete';
  key: string;
  value?: string;
  expires?: number;
  chain: (multi: ChainableCommander) => void;
}

type QueryMeta = DbQueryMeta | KvQueryMeta;

export interface QueryWrapper<T> {
  execute: () => Promise<T>;
  meta: QueryMeta;
}

export class DbRepository {
  protected wrap<
    TQuery extends RunnableQuery<any, any> & QueryPromise<any> & ({
      toSQL(): Query
    } | {
      getQuery(): Query
    }),
    TMap = undefined
  >(meta: {
    query: TQuery;
    name: string;
    map?: ((result: TQuery['_']['result']) => TMap) | undefined;
  }): QueryWrapper<
    undefined extends TMap ? TQuery['_']['result'] : TMap
  > {
    const sql = 'toSQL' in meta.query ? meta.query.toSQL() : meta.query.getQuery();
    let params: any[] = [];

    if (env.NODE_ENV !== 'production') {
      params = sql.params.map((param) => {
        try {
          return JSON.stringify(param);
        } catch {
          return String(param);
        }
      });
    }

    return {
      execute: (async () => {
        const result = await meta.query;
        return meta.map ? meta.map(result) : result;
      }) as any,
      meta: {
        queryType: 'db',
        name: meta.name,
        query: sql.sql,
        params
      }
    };
  }

  protected map = {
    firstRowOrNull: <T extends any[]>(rows: T): T[number] | null => {
      return rows.length > 0 ? rows[0] : null;
    },
    firstRow: <T extends any[]>(rows: T): T[number] => {
      return rows[0];
    },
    countRows: <T extends { count: number }[]>(rows: T): number => {
      return rows[0].count;
    },
    rowExists: <T extends { exists: boolean }[]>(rows: T): boolean => {
      return rows.length > 0 && rows[0].exists;
    }
  };

  protected utils = {
    exists: (db: DatabaseClient, table: Table, where: SQL | undefined) => {
      return db.execute<{ exists: boolean }>(sql`select exists(select 1 as "exists" from ${table} where ${where})`);
    }
  };
}

export class KvRepository {
  protected keys = {
    temporaryOsuTokens: (state: string) => `temp_osu_tokens:${state}`
  };

  protected map = {
    noop: <T>(value: T): T => value
  };

  protected wrap = {
    get: <TValue>(meta: {
      key: string;
      name: string;
      map: (value: string) => TValue;
    }): QueryWrapper<TValue | null> => {
      const cmd: [string] = [meta.key];

      return {
        execute: async () => {
          const value = await redis.get(...cmd);
          return value ? meta.map(value) : null;
        },
        meta: {
          queryType: 'kv',
          name: meta.name,
          method: 'get',
          key: meta.key,
          chain: (multi: ChainableCommander) => {
            multi.get(...cmd);
          }
        }
      };
    },
    set: <TValue>(meta: {
      key: string;
      value: TValue;
      name: string;
      map: (value: TValue) => string;
      /** In milliseconds */
      expires?: number;
    }): QueryWrapper<void> => {
      const value = meta.map(meta.value);
      const cmd: [string, string, ...any[]] = [meta.key, value, ...(meta.expires ? ['PX', meta.expires] : [])];

      return {
        execute: async () => {
          await redis.set(...cmd);
        },
        meta: {
          queryType: 'kv',
          name: meta.name,
          method: 'set',
          key: meta.key,
          value: value,
          expires: meta.expires,
          chain: (multi: ChainableCommander) => {
            multi.set(...cmd);
          }
        }
      };
    },
    delete: (meta: {
      key: string;
      name: string;
    }): QueryWrapper<void> => {
      const cmd: [string] = [meta.key];

      return {
        execute: async () => {
          await redis.del(...cmd);
        },
        meta: {
          queryType: 'kv',
          name: meta.name,
          method: 'delete',
          key: meta.key,
          chain: (multi: ChainableCommander) => {
            multi.del(...cmd);
          }
        }
      };
    }
  };
}

