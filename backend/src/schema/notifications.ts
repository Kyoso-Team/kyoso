import { eq, getTableName, SQL, sql } from 'drizzle-orm';
import {
  integer,
  pgTable,
  PgTable,
  pgView,
  primaryKey,
  QueryBuilder,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core';
import { User } from './users';
import { timestampConfig } from './utils';

export const Notification = pgTable('notification', {
  id: uuid().primaryKey().defaultRandom(),
  sentAt: timestamp(timestampConfig).notNull().defaultNow()
});

export const BasicNotification = pgTable('basic_notification', {
  notificationId: uuid().references(() => Notification.id, {
    onDelete: 'cascade'
  }),
  event: text({ enum: ['welcome'] }).notNull()
});

export const UpdatedUserNotification = pgTable('updated_user_notification', {
  notificationId: uuid().references(() => Notification.id, {
    onDelete: 'cascade'
  }),
  updated: text({ enum: ['admin', 'approvedHost'] }).notNull(),
  status: text({ enum: ['granted', 'removed'] }).notNull()
});

export const UserNotification = pgTable(
  'user_notification',
  {
    userId: integer().references(() => User.id, {
      onDelete: 'cascade'
    }),
    notificationId: text().references(() => Notification.id, {
      onDelete: 'cascade'
    }),
    seenAt: timestamp(timestampConfig)
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.notificationId]
    })
  ]
);

type MapNotificationData<T extends PgTable[]> = {
  [K in keyof T]: {
    type: T[K]['_']['name'] extends `${infer TType}_notification` ? TType : never;
  } & Omit<T[K]['$inferSelect'], 'notificationId'>;
}[keyof T];

type SelectNotification = {
  id: typeof Notification.id;
  sentAt: typeof Notification.sentAt;
  data: SQL.Aliased<
    MapNotificationData<[typeof BasicNotification, typeof UpdatedUserNotification]>
  >;
};

function buildNotificationQuery(qb: QueryBuilder, table: PgTable, data: SQL) {
  return qb
    .select({
      id: Notification.id,
      sentAt: Notification.sentAt,
      data: sql`json_build_object('type', '${getTableName(table).replace(
        '_notification',
        ''
      )}${data}')::jsonb`.as('data')
    } as SelectNotification)
    .from(Notification)
    .innerJoin(table, eq((table as any).id, Notification.id));
}

export const EveryNotification = pgView('every_notification').as((qb) =>
  buildNotificationQuery(qb, BasicNotification, sql`'event', ${BasicNotification.event}`).unionAll(
    buildNotificationQuery(
      qb,
      UpdatedUserNotification,
      sql`'updated', ${UpdatedUserNotification.updated}, 'status', ${UpdatedUserNotification.status}`
    )
  )
);
