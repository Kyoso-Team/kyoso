import { char, pgTable, varchar } from 'drizzle-orm/pg-core';

export const Country = pgTable('country', {
  code: char({
    length: 2
  }).primaryKey(),
  name: varchar({
    length: 35
  }).notNull()
});
