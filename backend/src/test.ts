import { expect } from 'bun:test';
import type { ClientResponse } from 'hono/client';
import type { ResponseFormat } from 'hono/types';
import type { AwaitedReturnType } from './types';

export function expectResponse<T extends ClientResponse<any, number, ResponseFormat>>(resp: T) {
  return {
    toEqual: async (
      status: number,
      data: ('error' | 'success' | (string & {})) | AwaitedReturnType<T['json']> | null
    ) => {
      expect(resp.status).toEqual(status);
      expect(await (typeof data === 'string' ? resp.text() : resp.json())).toStrictEqual(
        data === 'error' || data === 'success' ? expect.any(String) : data
      );
    }
  };
}
