import { existsSync, readdirSync } from 'node:fs';
import { select } from '@clack/prompts';
import { writeRepositoryFile, writeServiceFile, writeValidationFile } from './write-file';

export async function create(file: 'repository.ts' | 'service.ts' | 'validation.ts') {
  const folderNames = readdirSync(`${process.cwd()}/src/modules`, {
    withFileTypes: true
  })
    .filter((item) => item.isDirectory())
    .map((folder) => folder.name);

  const folderName = await select({
    message: `Create ${file} in`,
    options: folderNames.map((name) => ({ value: name }))
  });

  if (typeof folderName === 'symbol') {
    process.exit(0);
  }

  if (existsSync(`${process.cwd()}/src/modules/${folderName}/${file}`)) {
    console.log(`${file} already exists in ${folderName}`);
    process.exit(1);
  }

  if (file === 'repository.ts') {
    await writeRepositoryFile(folderName);
  } else if (file === 'service.ts') {
    await writeServiceFile(folderName);
  } else if (file === 'validation.ts') {
    await writeValidationFile(folderName);
  }

  process.exit(0);
}
