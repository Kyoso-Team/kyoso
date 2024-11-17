import { db } from '$src/singletons/db';
import { databaseRepository } from '$src/modules/database/repository';
import { $ } from 'bun';

await databaseRepository.resetDatabase(db);
await databaseRepository.prePushDatabase(db);

await $`bunx drizzle-kit push`.quiet();
await db.$client.end();
