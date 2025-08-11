import { redis } from '$src/singletons';
import { serializeToConsole } from '$src/utils';
import { env } from '$src/utils/env';
import { TrackValue } from './common';
import type { ChainableCommander } from 'ioredis';
import type { BaseQueryMeta, QueryWrapper } from './common';

export interface KvQueryMeta extends BaseQueryMeta {
  queryType: 'kv';
  method: 'get' | 'set' | 'del';
  key: string;
  input?: string;
  output?: TrackValue;
  mappedOutput?: TrackValue;
  expires?: number;
  chain: (multi: ChainableCommander) => void;
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
      const cmd: [string, string, ...any[]] = [
        meta.key,
        value,
        ...(meta.expires ? ['PX', meta.expires] : [])
      ];

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
    delete: (meta: { key: string; name: string }): QueryWrapper<void> => {
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
