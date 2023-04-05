/* eslint-disable security/detect-non-literal-regexp */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// @ts-check
import chalk from 'chalk';
import { camelCase, pascalCase } from 'change-case';
import exec from 'node-async-exec';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { appendFile, readFile, writeFile } from 'fs/promises';

export const lintBackend = async (/** @type {boolean} */ dryRun) => {
  if (!dryRun) {
    const path = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
    console.log('lintBackend path:', path);
    await exec({
      cmd: `./node_modules/.bin/eslint '{src,apps,libs,test}/**/*.ts' --fix --cache --cache-location ./.eslintcache`,
      path,
    });
    await exec({
      cmd: `./node_modules/.bin/prettier --write "src/**/*.ts" "test/**/*.ts"`,
      path,
    });
  }
};

export const typeormModelInjectImport = async (
  /** @type {boolean} */ dryRun,
  /** @type {string} */ searchForInjectable,
  /** @type {string} */ entityName,
) => {
  console.log('entityName: ', entityName);
  const typeormImportsRegexp =
    /(import {[\nA-Za-z, ]*)( |,\n)} from 'typeorm';/g;

  const filePath = join(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    `./src/infrastructure/database/model/${camelCase(entityName)}.model.ts`,
  );
  console.log('filePath: ', filePath);

  let tsFileContent = (await readFile(filePath)).toString();

  let {
    ['1']: group,
    ['2']: spaceGroup,
    index,
  } = [...tsFileContent.matchAll(typeormImportsRegexp)][0];

  if (!index) throw new Error('typeormImportsRegexp was not found');

  const shouldWeInjectImport = !group.includes(` ${searchForInjectable}`);

  if (shouldWeInjectImport)
    tsFileContent = `${tsFileContent.slice(0, index + group.length)}${
      spaceGroup === ' ' ? ', ' : ',\n  '
    }${searchForInjectable}${tsFileContent.slice(index + group.length)}`;

  console.log(tsFileContent);

  if (!dryRun && shouldWeInjectImport) {
    await writeFile(filePath, tsFileContent);
  }
};

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
    `./backend/src/infrastructure/database/model/${camelCase(
      entityName,
    )}.model.ts`,
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
    `./backend/src/infrastructure/database/model/${camelCase(
      entityName,
    )}.model.ts`,
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
    `./backend/src/infrastructure/database/model/${camelCase(
      entityName,
    )}.model.ts`,
    dryRun,
    `./backend/src/infrastructure/database/model/index.ts`,
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
export async function writeNewDI_RepoFileAndExtendDirReexportsAndLog(
  entityName,
  content,
  dryRun,
) {
  await writeNewFileAndExtendDirReexportsAndLog(
    'DI Repo',
    `DI_${entityName}Repo`,
    content,
    `./backend/src/infrastructure/database/di/${camelCase(
      entityName,
    )}.repo.di.ts`,
    dryRun,
    `./backend/src/infrastructure/database/di/index.ts`,
    `export { DI_${pascalCase(entityName)}Repo, RepoTypes as ${pascalCase(
      entityName,
    )}RepoTypes } from './${camelCase(entityName)}.repo.di';\n`,
  );
}

/**
 * @param {string} entityName
 * @param {string} content
 * @param {boolean} dryRun
 */
export async function writeNewDI_UseCaseFileAndExtendDirReexportsAndLog(
  entityName,
  content,
  dryRun,
) {
  await writeNewFileAndExtendDirReexportsAndLog(
    'DI Use Case',
    `DI_${entityName}UseCase`,
    content,
    `./backend/src/${camelCase(entityName)}/di/${camelCase(
      entityName,
    )}.useCase.di.ts`,
    dryRun,
    `./backend/src/${camelCase(entityName)}/di/index.ts`,
    `export { DI_${pascalCase(entityName)}UseCase } from './${camelCase(
      entityName,
    )}.useCase.di';\n`,
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
    `./backend/src/infrastructure/database/repo/${camelCase(
      entityName,
    )}.repo.ts`,
    dryRun,
    `./backend/src/infrastructure/database/repo/index.ts`,
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
