import { writeFileSync } from 'node:fs';
import { camelCase, pascalCase } from 'scule';

export async function writeRepositoryFile(folder: string) {
  writeFileSync(
    `${process.cwd()}/src/modules/${folder}/repository.ts`,
    await Bun.file(`${process.cwd()}/scripts/modules/repository.template.txt`)
      .text()
      .then((txt) => txt.replace('{$1}', camelCase(folder)))
  );
}

export async function writeServiceFile(folder: string) {
  writeFileSync(
    `${process.cwd()}/src/modules/${folder}/service.ts`,
    await Bun.file(`${process.cwd()}/scripts/modules/service.template.txt`)
      .text()
      .then((txt) =>
        txt
          .replace('{$1}', camelCase(folder))
          .replace('{$2}', pascalCase(folder))
          .replace('{$3}', camelCase(folder))
      )
  );
}

export async function writeValidationFile(folder: string) {
  writeFileSync(
    `${process.cwd()}/src/modules/${folder}/validation.ts`,
    await Bun.file(`${process.cwd()}/scripts/modules/validation.template.txt`)
      .text()
      .then((txt) => txt.replace('{$1}', pascalCase(folder)))
  );
}
