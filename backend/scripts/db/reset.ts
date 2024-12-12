import { databaseRepository } from '$src/modules/database/repository';
import { db } from '$src/singletons/db';

await databaseRepository.resetDatabase(db);
await db.$client.end();
