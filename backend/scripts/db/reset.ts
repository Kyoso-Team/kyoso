import { db } from '$src/singletons/db';
import { databaseRepository } from '$src/modules/database/repository';

await databaseRepository.resetDatabase(db);
await db.$client.end();
