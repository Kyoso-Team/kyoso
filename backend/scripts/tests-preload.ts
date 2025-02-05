import { existsSync } from 'fs';
import { $ } from 'bun';

if (
  !existsSync(`${process.cwd()}/test-tokens/discord.json`) ||
  !existsSync(`${process.cwd()}/test-tokens/osu.json`)
) {
  console.log(
    'Missing tokens for test environment. Start a dev server and go through auth flow before running tests'
  );
  process.exit(1);
}

await $`bun db:push`.quiet();

console.log('Ready for testing');
