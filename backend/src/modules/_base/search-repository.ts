import type { Hits, Index, SearchParams } from 'meilisearch';
import { TrackValue, type BaseQueryMeta, type QueryWrapper } from './common';
import { meilisearch } from '$src/singletons/meilisearch';
import { serializeToConsole } from '$src/utils';
import { env } from '$src/utils/env';

export type UserDoc = {
  osuUserId: number;
  discordUserId: string; //using string instead of bigint due to serialization issues
  username: string;
  banned: boolean;
};

export type TournamentDoc = {
  id: number;
  name: string;
  acronym: string;
  urlSlug: string;
  publishedAt: Date | null;
  deletedAt: Date | null;
};

export interface SearchQueryMeta extends BaseQueryMeta {
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

export class SearchRepository {
  protected indexes = {
    test: new SearchIndex<{ id: number; value: string }>('test'),
    tournament: new SearchIndex<TournamentDoc>('tournament')
  };
}

export class SearchIndex<TData extends Record<string, any>> {
  private idx: Index<TData>;
  public $document: TData = undefined as any;

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