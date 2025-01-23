import * as v from 'valibot';
import type { DatabaseClient } from '$src/types';
import type { NotificationsValidation } from './validation';
import { Notification } from '$src/schema';
import { eq, sql } from 'drizzle-orm';

async function createNotification(db: DatabaseClient, notification: v.InferOutput<typeof NotificationsValidation['CreateNotification']>) {
  const id = Bun.randomUUIDv7();
  return db.insert(Notification).values({
    ...notification,
    id,
    sentAt: notification.sentAt ?? sql`now()`
  });
}

async function rescheduleNotification(db: DatabaseClient, notificationId: string, sentAt: Date) {
  return db
    .update(Notification)
    .set({ sentAt })
    .where(eq(Notification.id, notificationId));
}

export const notificationsRepository = { createNotification };
