import { db } from '$src/singletons';
import { Service } from '$src/utils/service';
import { testRepository } from './test.repository';

export class TestService extends Service {
  public async createTestTable() {
    await this.execute(testRepository.db.createTestTable(db));
  }

  public insertUser(name: string) {
    return this.execute(testRepository.db.insertUser(db, name));
  }

  public updateUser(id: number, name: string) {
    return this.execute(testRepository.db.updateUser(db, id, name));
  }

  public deleteUser(id: number) {
    return this.execute(testRepository.db.deleteUser(db, id));
  }

  public deleteTestTable() {
    return this.execute(testRepository.db.deleteTestTable(db));
  }

  public countUsers(id: number) {
    return this.execute(testRepository.db.countUsers(db, id));
  }

  public testTransaction() {
    return this.transaction(db, 'Test', async (tx) => {
      const user = await this.execute(testRepository.db.insertUser(tx, 'Sample User'));
      await this.execute(testRepository.db.deleteUser(tx, user.id));
    });
  }

  public setTestValue(value: string, ex?: number) {
    return this.execute(testRepository.kv.setTestValue(value, ex));
  }

  public getTestValue() {
    return this.execute(testRepository.kv.getTestValue());
  }

  public deleteTestValue() {
    return this.execute(testRepository.kv.deleteTestValue());
  }
}