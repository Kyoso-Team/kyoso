import { $ } from 'bun';
import { resetDatabase } from '$src/dev';
import { db } from '$src/singletons/db';

await resetDatabase();

await $`bunx drizzle-kit push`.quiet();
await db.$client.end();
process.exit(0);
