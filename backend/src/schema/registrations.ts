import {
  integer,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  varchar
} from 'drizzle-orm/pg-core';
import { StaffPermission } from './enums';
import { Tournament } from './tournaments';
import { User } from './users';
import { timestampConfig } from './utils';

export const StaffRole = pgTable(
  'staff_role',
  {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    createdAt: timestamp('created_at', timestampConfig).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', timestampConfig),
    name: varchar('name', { length: 50 }).notNull(),
    color: text({
      enum: [
        'slate',
        'gray',
        'red',
        'orange',
        'yellow',
        'lime',
        'green',
        'emerald',
        'cyan',
        'blue',
        'indigo',
        'purple',
        'fuchsia',
        'pink'
      ]
    })
      .notNull()
      .default('slate'),
    order: smallint().notNull(),
    permissions: StaffPermission().array().notNull().default([]),
    tournamentId: integer()
      .notNull()
      .references(() => Tournament.id, {
        onDelete: 'cascade'
      })
  },
  (table) => [unique('staff_role_name_tournament_id_uni').on(table.name, table.tournamentId)]
);

export const StaffMember = pgTable(
  'staff_member',
  {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    joinedStaffAt: timestamp(timestampConfig).notNull().defaultNow(),
    deletedAt: timestamp(timestampConfig),
    userId: integer().references(() => User.id, {
      onDelete: 'set null'
    }),
    tournamentId: integer()
      .notNull()
      .references(() => Tournament.id, {
        onDelete: 'cascade'
      })
  },
  (table) => [unique('staff_member_user_id_tournament_id_uni').on(table.userId, table.tournamentId)]
);

export const StaffMemberRole = pgTable(
  'staff_member_role',
  {
    staffMemberId: integer()
      .notNull()
      .references(() => StaffMember.id, {
        onDelete: 'cascade'
      }),
    staffRoleId: integer()
      .notNull()
      .references(() => StaffRole.id, {
        onDelete: 'cascade'
      })
  },
  (table) => [
    primaryKey({
      columns: [table.staffMemberId, table.staffRoleId]
    })
  ]
);
