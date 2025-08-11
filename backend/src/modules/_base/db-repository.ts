import { QueryPromise, sql } from 'drizzle-orm';
import { serializeToConsole } from '$src/utils';
import { env } from '$src/utils/env';
import { TrackValue } from './common';
import type { Query, SQL, Table } from 'drizzle-orm';
import type { RunnableQuery } from 'drizzle-orm/runnable-query';
import type { DatabaseClient } from '$src/types';
import type { BaseQueryMeta, QueryWrapper } from './common';

export interface DbQueryMeta extends BaseQueryMeta {
  queryType: 'db';
  query: string;
  params: any[];
  output: TrackValue;
  mappedOutput: TrackValue;
}

export type GetQueryReturnType<TQuery extends (...params: any[]) => QueryWrapper<any>> = Awaited<ReturnType<ReturnType<TQuery>['execute']>>;

export class DbRepository {
  protected wrap<
    TQuery extends RunnableQuery<any, any> &
      QueryPromise<any> &
      (
        | {
            toSQL(): Query;
          }
        | {
            getQuery(): Query;
          }
      ),
    TMap = undefined
  >(meta: {
    query: TQuery;
    name: string;
    map?: ((result: TQuery['_']['result']) => TMap) | undefined;
  }): QueryWrapper<undefined extends TMap ? TQuery['_']['result'] : TMap> {
    const sql = 'toSQL' in meta.query ? meta.query.toSQL() : meta.query.getQuery();
    const params: any[] =
      env.NODE_ENV !== 'production' ? sql.params.map((v) => serializeToConsole(v)) : [];
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
      return db.execute<{ exists: boolean }>(
        sql`select exists(select 1 as "exists" from ${table} where ${where})`
      );
    }
  };
}
