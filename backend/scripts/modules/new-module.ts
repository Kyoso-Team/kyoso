import { mkdirSync, readdirSync } from 'node:fs';
import { multiselect, text } from '@clack/prompts';
import { writeRepositoryFile, writeServiceFile, writeValidationFile } from './write-file';

const folderName = await text({
  message: 'Module folder name',
  placeholder: 'my-module',
  validate(value) {
    if (value.length === 0) return 'Specify a folder name';
  }
});

if (typeof folderName === 'symbol') {
  process.exit(0);
}

const folderNames = readdirSync(`${process.cwd()}/src/modules`, {
  withFileTypes: true
})
  .filter((item) => item.isDirectory())
  .map((folder) => folder.name);

if (folderNames.includes(folderName)) {
  console.log(`Folder ${folderName} already exists`);
  process.exit(1);
}

const files = await multiselect({
  message: 'Files to create',
  options: [{ value: 'repository.ts' }, { value: 'service.ts' }, { value: 'validation.ts' }],
  required: true
});

if (typeof files === 'symbol') {
  process.exit(0);
}

mkdirSync(`${process.cwd()}/src/modules/${folderName}`);

for (const file of files) {
  if (file === 'repository.ts') {
    await writeRepositoryFile(folderName);
  } else if (file === 'service.ts') {
    await writeServiceFile(folderName);
  } else {
    await writeValidationFile(folderName);
  }
}

process.exit(0);
