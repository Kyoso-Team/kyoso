import { char, pgTable, varchar } from 'drizzle-orm/pg-core';

export const Country = pgTable('country', {
  code: char('code', {
    length: 2
  }).primaryKey(),
  name: varchar('name', {
    length: 35
  }).notNull()
});
