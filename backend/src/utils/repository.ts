import { env } from './env';
import type { RunnableQuery } from 'drizzle-orm/runnable-query';
import { sql, type Query, type QueryPromise, type SQL, type Table } from 'drizzle-orm';
import type { ChainableCommander } from 'ioredis';
import { redis } from '$src/singletons';
import type { DatabaseClient, MeilisearchTournamentIndex } from '$src/types';
import { serializeToConsole } from '.';
import { meilisearch } from '$src/singletons/meilisearch';
import type { Hits, Index, SearchParams } from 'meilisearch';

interface BaseQueryMeta {
  name: string;
}

interface DbQueryMeta extends BaseQueryMeta {
  queryType: 'db';
  query: string;
  params: any[];
  output: TrackValue;
  mappedOutput: TrackValue;
}

interface KvQueryMeta extends BaseQueryMeta {
  queryType: 'kv';
  method: 'get' | 'set' | 'del';
  key: string;
  input?: string;
  output?: TrackValue;
  mappedOutput?: TrackValue;
  expires?: number;
  chain: (multi: ChainableCommander) => void;
}

interface SearchQueryMeta extends BaseQueryMeta {
  queryType: 'search';
  index: string;
  method: 'updateDocuments' | 'deleteDocument' | 'searchDocuments';
  documentId?: string;
  search?: {
    query: string;
    options?: SearchParams;
  }
  input?: string;
  output?: TrackValue;
}

type QueryMeta = DbQueryMeta | KvQueryMeta | SearchQueryMeta;

export interface QueryWrapper<T> {
  execute: () => Promise<T>;
  meta: QueryMeta;
}

class TrackValue {
  private value: any;

  constructor(initialValue: any) {
    this.value = initialValue;
  }

  public set(value: any) {
    this.value = value;
  }

  public get() {
    return this.value;
  }
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
    const params: any[] = env.NODE_ENV !== 'production' ? sql.params.map((v) => serializeToConsole(v)) : [];
    const output = new TrackValue('undefined');
    const mappedOutput = new TrackValue('undefined');

    return {
      execute: (async () => {
        const result = await meta.query;
        let mapped: any;

        if (env.NODE_ENV !== 'production') {
          output.set(serializeToConsole(result));
  
          if (meta.map) {
            mapped = meta.map(result);
            mappedOutput.set(serializeToConsole(mapped));
          }
        }
        
        return meta.map && mapped !== undefined ? mapped : result;
      }) as any,
      meta: {
        queryType: 'db',
        name: meta.name,
        query: sql.sql,
        params,
        output,
        mappedOutput
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
      map: (value: string | null) => TValue;
    }): QueryWrapper<TValue | null> => {
      const cmd: [string] = [meta.key];
      const output = new TrackValue('undefined');
      const mappedOutput = new TrackValue('undefined');

      return {
        execute: async () => {
          const result = await redis.get(...cmd);
          let mapped: any;

          if (env.NODE_ENV !== 'production') {
            output.set(serializeToConsole(result));
            mapped = meta.map(result);
            mappedOutput.set(serializeToConsole(mapped));
          }

          return mapped !== undefined ? mapped : result;
        },
        meta: {
          queryType: 'kv',
          name: meta.name,
          method: 'get',
          key: meta.key,
          output,
          mappedOutput,
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
          input: value,
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
          method: 'del',
          key: meta.key,
          chain: (multi: ChainableCommander) => {
            multi.del(...cmd);
          }
        }
      };
    }
  };
}

export class SearchRepository {
  protected indexes = {
    test: new SearchIndex<{ id: number; value: string }>('test'),
    tournament: new SearchIndex<MeilisearchTournamentIndex>('tournament')
  };
}

export class SearchIndex<TData extends Record<string, any>> {
  private idx: Index<TData>;

  constructor(private idxName: string) {
    this.idx = meilisearch.index<TData>(this.idxName);
  }

  public updateDocuments<TInput extends TData[]>(meta: {
    name: string;
    input: TInput;
  }): QueryWrapper<void> {
    const value = meta.input;

    return {
      execute: async () => {
        await this.idx.updateDocuments(value);
      },
      meta: {
        queryType: 'search',
        method: 'updateDocuments',
        name: meta.name,
        index: this.idxName,
        input: serializeToConsole(value)
      }
    };
  }

  public deleteDocument(meta: {
    name: string;
    documentId: string | number;
  }): QueryWrapper<void> {
    return {
      execute: async () => {
        await this.idx.deleteDocument(meta.documentId);
      },
      meta: {
        queryType: 'search',
        method: 'deleteDocument',
        name: meta.name,
        index: this.idxName,
        documentId: meta.documentId.toString()
      }
    };
  }

  public searchDocuments<TSearchOptions extends SearchParams>(meta: {
    name: string;
    query: string;
    searchOptions?: TSearchOptions;
  }): QueryWrapper<Hits<TData>> {
    const output = new TrackValue('undefined');

    return {
      execute: async () => {
        const result = await this.idx.search(meta.query, meta.searchOptions);
        const hits = result.hits;
        
        if (env.NODE_ENV !== 'production') {
          output.set(serializeToConsole(hits));
        }
        
        return hits;
      },
      meta: {
        queryType: 'search',
        method: 'searchDocuments',
        name: meta.name,
        index: this.idxName,
        output,
        search: {
          query: meta.query,
          options: meta.searchOptions
        }
      }
    };
  }
}
