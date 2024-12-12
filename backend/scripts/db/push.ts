import { $ } from 'bun';
import { databaseRepository } from '$src/modules/database/repository';
import { db } from '$src/singletons/db';

await databaseRepository.resetDatabase(db);
await databaseRepository.prePushDatabase(db);

await $`bunx drizzle-kit push`.quiet();
await db.$client.end();
