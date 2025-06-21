import { count, eq, sql } from 'drizzle-orm';
import { pick } from '$src/utils/query';
import type { DatabaseClient } from '$src/types';
import { DbRepository, KvRepository } from '$src/utils/repository';
import { pgTable, serial, text } from 'drizzle-orm/pg-core';

const Test = pgTable('test', {
  id: serial('id').primaryKey(),
  name: text('name').notNull()
});

class TestDbRepository extends DbRepository {
  public createTestTable(db: DatabaseClient) {
    const query = db.execute(sql`create table if not exists "test" ("id" serial primary key, "name" text not null)`);

    return this.wrap({
      query,
      name: 'Create test table'
    });
  }

  public insertUser(db: DatabaseClient, name: string) {
    const query = db
      .insert(Test)
      .values({ name })
      .returning(pick(Test, { id: true }));

    return this.wrap({
      query,
      name: 'Insert user into test table',
      map: this.map.firstRow
    });
  }

  public updateUser(db: DatabaseClient, id: number, name: string) {
    const query = db
      .update(Test)
      .set({ name })
      .where(eq(Test.id, id));

    return this.wrap({
      query,
      name: 'Update user in test table'
    });
  }

  public deleteUser(db: DatabaseClient, id: number) {
    const query = db
      .delete(Test)
      .where(eq(Test.id, id));

    return this.wrap({
      query,
      name: 'Delete user from test table'
    });
  }

  public deleteTestTable(db: DatabaseClient) {
    const query = db.execute(sql`drop table if exists "test"`);

    return this.wrap({
      query,
      name: 'Delete test table'
    });
  }

  public countUsers(db: DatabaseClient, id: number) {
    const query = db.select({ count: count().as('count') }).from(Test).where(eq(Test.id, id));

    return this.wrap({
      query,
      name: 'Count users',
      map: this.map.countRows
    });
  }
}

class TestKvRepository extends KvRepository {
  public setTestValue(value: string, ex?: number) {
    return this.wrap.set({
      key: 'test_value',
      value,
      map: this.map.noop,
      name: 'Set test value',
      expires: ex
    });
  }

  public getTestValue() {
    return this.wrap.get({
      key: 'test_value',
      name: 'Get test value',
      map: (value: string) => value
    });
  }

  public deleteTestValue() {
    return this.wrap.delete({
      key: 'test_value',
      name: 'Delete test value'
    });
  }
}

class TestRepository {
  public db = new TestDbRepository();
  public kv = new TestKvRepository();
}

export const testRepository = new TestRepository();
