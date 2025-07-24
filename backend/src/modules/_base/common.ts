import type { DbQueryMeta } from './db-repository';
import type { KvQueryMeta } from './kv-repository';
import type { SearchQueryMeta } from './search-repository';

export class TrackValue {
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

export interface BaseQueryMeta {
  name: string;
}

type QueryMeta = DbQueryMeta | KvQueryMeta | SearchQueryMeta;

export interface QueryWrapper<T> {
  execute: () => Promise<T>;
  meta: QueryMeta;
}
