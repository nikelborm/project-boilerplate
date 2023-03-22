// @ts-check
import chalk from 'chalk';
import { camelCase, pascalCase } from 'change-case';
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { appendFile, readFile, writeFile } from 'fs/promises';

export const writeNewFileWithMixin = async (
  /** @type {string} */ filename,
  /** @type {string} */ mixin,
  /** @type {RegExp} */ regex,
) => {
  let tsFileContent = (await readFile(filename)).toString();

  let { index } = [...tsFileContent.matchAll(regex)][0];
  if (index === undefined) throw new Error('regex was not found');

  const updatedFile = `${tsFileContent.slice(
    0,
    index,
  )}${mixin}${tsFileContent.slice(index)}`;

  await writeFile(filename, updatedFile);
};

/**
 * @param {string} filePurpose
 * @param {string} entityName
 * @param {string} mixin
 * @param {string} path
 * @param {RegExp} regex
 * @param {boolean} dryRun
 */
export async function appendMixinToFileAndLog(
  filePurpose,
  entityName,
  mixin,
  path,
  regex,
  dryRun,
) {
  console.log(
    chalk.cyan(
      `\n------ Mixin to ${pascalCase(
        entityName,
      )} ${filePurpose} (${path}) was generated:\n`,
    ),
  );
  console.log(mixin);

  if (!dryRun) {
    try {
      await writeNewFileWithMixin(path, mixin, regex);
      console.log(
        chalk.gray(
          `\n------ Mixin to ${pascalCase(
            entityName,
          )} ${filePurpose} was written to disk\n`,
        ),
      );
    } catch (error) {
      console.log(
        chalk.red(
          `\n------ Failed to write updated file with mixin ${pascalCase(
            entityName,
          )} ${filePurpose}:\n`,
        ),
      );
      console.log(chalk.red(error));
    }
  }
}

/**
 * @param {string} entityName
 * @param {string} mixin
 * @param {boolean} dryRun
 */
export async function appendModelBodyMixinToFileAndLog(
  entityName,
  mixin,
  dryRun,
) {
  await appendMixinToFileAndLog(
    'model class',
    entityName,
    mixin,
    `./backend/src/infrastructure/model/${camelCase(entityName)}.model.ts`,
    /}\n$/g,
    dryRun,
  );
}

/**
 * @param {string} entityName
 * @param {string} mixin
 * @param {boolean} dryRun
 */
export async function appendModelImportsMixinToFileAndLog(
  entityName,
  mixin,
  dryRun,
) {
  await appendMixinToFileAndLog(
    "model's file imports",
    entityName,
    mixin,
    `./backend/src/infrastructure/model/${camelCase(entityName)}.model.ts`,
    /\n*@Entity/g,
    dryRun,
  );
}

/**
 * @param {string} filePurpose
 * @param {string} entityName
 * @param {string} fileContent
 * @param {string} path
 * @param {boolean} dryRun
 */
export async function writeNewFileAndAndLog(
  filePurpose,
  entityName,
  fileContent,
  path,
  dryRun,
) {
  console.log(
    chalk.cyan(
      `\n------ New ${pascalCase(
        entityName,
      )} ${filePurpose} (${path}) was generated:\n`,
    ),
  );
  console.log(fileContent);

  if (!dryRun) {
    try {
      await writeFile(path, fileContent);
      console.log(
        chalk.gray(
          `\n------ New ${pascalCase(
            entityName,
          )} ${filePurpose} was written to disk:\n`,
        ),
      );
    } catch (error) {
      console.log(
        chalk.red(
          `\n------ Failed to write new file ${pascalCase(
            entityName,
          )} ${filePurpose}:\n`,
        ),
      );
      console.log(chalk.red(error));
    }
  }
}

/**
 * @param {string} filePurpose
 * @param {string} entityName
 * @param {string} fileContent
 * @param {string} path
 * @param {boolean} dryRun
 * @param {string} indexPath
 * @param {string} indexMixin
 */
export async function writeNewFileAndExtendDirReexportsAndLog(
  filePurpose,
  entityName,
  fileContent,
  path,
  dryRun,
  indexPath,
  indexMixin,
) {
  await writeNewFileAndAndLog(
    filePurpose,
    entityName,
    fileContent,
    path,
    dryRun,
  );

  if (!dryRun) {
    await appendFile(indexPath, indexMixin);
    console.log(
      chalk.gray(
        `------ index.ts reexport of ${pascalCase(
          entityName,
        )} ${filePurpose} was written to disk:\n`,
      ),
    );
  }
}

/**
 * @param {string} entityName
 * @param {string} content
 * @param {boolean} dryRun
 */
export async function writeNewModelFileAndExtendDirReexportsAndLog(
  entityName,
  content,
  dryRun,
) {
  await writeNewFileAndExtendDirReexportsAndLog(
    'model',
    entityName,
    content,
    `./backend/src/infrastructure/model/${camelCase(entityName)}.model.ts`,
    dryRun,
    `./backend/src/infrastructure/model/index.ts`,
    `export * from './${camelCase(entityName)}.model';\n`,
  );
}

/**
 * @param {string} entityName
 * @param {string} content
 * @param {boolean} dryRun
 */
export async function writeNewModelInterfaceFileAndExtendDirReexportsAndLog(
  entityName,
  content,
  dryRun,
) {
  await writeNewFileAndExtendDirReexportsAndLog(
    'model interface',
    `I${entityName}`,
    content,
    `./shared/src/types/shared/model/${camelCase(entityName)}.model.ts`,
    dryRun,
    `./shared/src/types/shared/model/index.ts`,
    `export * from './${camelCase(entityName)}.model';\n`,
  );
}
/**
 * @param {string} entityName
 * @param {string} content
 * @param {boolean} dryRun
 */
export async function writeNewRepositoryFileAndExtendDirReexportsAndLog(
  entityName,
  content,
  dryRun,
) {
  await writeNewFileAndExtendDirReexportsAndLog(
    'repo',
    `${entityName}Repo`,
    content,
    `./backend/src/infrastructure/repo/${camelCase(entityName)}.repo.ts`,
    dryRun,
    `./backend/src/infrastructure/repo/index.ts`,
    `export * from './${camelCase(entityName)}.repo';\n`,
  );
}

/**
 * @param {string} entityName
 * @param {string} mixin
 * @param {boolean} dryRun
 */
export async function appendModelInterfaceBodyMixinToFileAndLog(
  entityName,
  mixin,
  dryRun,
) {
  await appendMixinToFileAndLog(
    'model interface class',
    `I${entityName}`,
    mixin,
    `./shared/src/types/shared/model/${camelCase(entityName)}.model.ts`,
    /}\n$/g,
    dryRun,
  );
}

/**
 * @param {string} entityName
 * @param {string} mixin
 * @param {boolean} dryRun
 */
export async function appendModelInterfaceImportsMixinToFileAndLog(
  entityName,
  mixin,
  dryRun,
) {
  await appendMixinToFileAndLog(
    'model interface imports',
    `I${entityName}`,
    mixin,
    `./shared/src/types/shared/model/${camelCase(entityName)}.model.ts`,
    /\n*export class I/g,
    dryRun,
  );
}

/**
 * @param {string} entityName
 * @param {string} mixin
 * @param {boolean} dryRun
 * @param {RegExp} regex
 */
export async function appendRelationMapMixinToFileAndLog(
  entityName,
  mixin,
  dryRun,
  regex,
) {
  await appendMixinToFileAndLog(
    'Relation map',
    entityName,
    mixin,
    `./backend/src/types/private/relationMap.ts`,
    regex,
    dryRun,
  );
}
