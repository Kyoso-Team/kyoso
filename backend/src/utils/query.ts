import type { PgTable } from 'drizzle-orm/pg-core';
import type { Selection } from '$src/types';

export function pick<TTable extends PgTable, TSelection extends Selection<TTable>>(
  table: TTable,
  select: TSelection
): {
  [K in keyof TTable['_']['columns'] as TSelection[K] extends true
    ? K
    : never]: TTable['_']['columns'][K];
} {
  const selection: Record<string, any> = {};

  for (const [key, value] of Object.entries(select)) {
    const column = table[key as keyof typeof table];
    if (value === true && column) {
      selection[key] = column;
    }
  }

  return selection as any;
}
