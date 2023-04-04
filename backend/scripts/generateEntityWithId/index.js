/* eslint-disable security/detect-non-literal-regexp */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// @ts-check
import { camelCase, pascalCase, snakeCase } from 'change-case';
import prompts from 'prompts';
import chalk from 'chalk';
import {
  appendRelationMapMixinToFileAndLog,
  writeNewDI_RepoFileAndExtendDirReexportsAndLog,
  writeNewModelFileAndExtendDirReexportsAndLog,
  writeNewModelInterfaceFileAndExtendDirReexportsAndLog,
  writeNewRepositoryFileAndExtendDirReexportsAndLog,
} from '../common/index.js';

const { first, selectedFilesToGenerate, dryRun } = await prompts([
  {
    type: 'text',
    name: 'first',
    message: 'Entity name (fully lower case) with space delimiter',
  },
  {
    type: 'toggle',
    name: 'dryRun',
    message:
      'Dry run? (Should script skip real writes to file?) [Press Tab to switch mode]',
    initial: false,
    active: 'yes',
    inactive: 'no',
  },
  {
    type: 'multiselect',
    name: 'selectedFilesToGenerate',
    message: 'Pick files to generate',
    choices: [
      { title: 'Database model', value: 'databaseModel', selected: true },
      { title: 'Interface', value: 'interface', selected: true },
      { title: 'Repository', value: 'repository', selected: true },
      { title: 'DI Repository', value: 'DI_Repository', selected: true },
      {
        title: 'Relation map extension',
        value: 'relationMapExtension',
        selected: true,
      },
    ],
    hint: '- Space to select. Enter to submit',
  },
]);

const pascal = pascalCase(first);
const snake = snakeCase(first);
const camel = camelCase(first);

const getModel =
  () => `/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { PrimaryIdentityColumn } from 'src/tools';
${
  selectedFilesToGenerate.includes('interface')
    ? `import type { I${pascal} } from 'src/types';`
    : ''
}
import { CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity({ name: '${snake}' })
export class ${pascal} ${
    selectedFilesToGenerate.includes('interface')
      ? `implements I${pascal} `
      : ''
  }{
  @PrimaryIdentityColumn('${snake}_id')
  id!: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}
`;

const getInterface = () => `//

export class I${pascal} {
  id!: number;

  createdAt!: Date;

  updatedAt!: Date;
}
`;

const getRelationMapMixin = () => `  ${pascal}: {
    identityKeys: ['id'],
    relationToEntityNameMap: {
      // ${pascal} relationToEntityNameMap token
    },
  },
`;

const getRepo =
  () => `import { Injectable, type Provider } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DefaultEntityWithIdRepoImplementation } from 'src/tools';
import { Repository } from 'typeorm';
import { DI_${pascal}Repo, type RepoTypes } from '../di/${camel}.repo.di';
import { ${pascal} } from '../model';

@Injectable()
class ${pascal}Repo
  extends DefaultEntityWithIdRepoImplementation<RepoTypes>
  implements DI_${pascal}Repo
{
  constructor(
    @InjectRepository(${pascal})
    protected override readonly repo: Repository<${pascal}>,
  ) {
    super(repo);
  }
}

export const ${pascal}RepoDIProvider: Provider = {
  provide: DI_${pascal}Repo,
  useClass: ${pascal}Repo,
};
`;

const getDI_Repo = () => `import {
  type EntityRepoMethodTypes,
  type I${pascal},
  IDefaultIdRepo,
} from 'src/types';

export abstract class DI_${pascal}Repo extends IDefaultIdRepo<RepoTypes> {}

export type RepoTypes = EntityRepoMethodTypes<
  I${pascal},
  {
    EntityName: '${pascal}';

    RequiredToCreateAndSelectRegularPlainKeys: 'createdAt' | 'updatedAt';

    OptionalToCreateAndSelectRegularPlainKeys: null;

    ForbiddenToCreateGeneratedPlainKeys: 'id' | 'createdAt' | 'updatedAt';
    ForbiddenToUpdatePlainKeys: 'id' | 'createdAt' | 'updatedAt';
    ForbiddenToUpdateRelationKeys: null;

    UnselectedByDefaultPlainKeys: null;
  }
>;
`;

if (selectedFilesToGenerate.includes('databaseModel')) {
  await writeNewModelFileAndExtendDirReexportsAndLog(first, getModel(), dryRun);
}

if (selectedFilesToGenerate.includes('interface')) {
  await writeNewModelInterfaceFileAndExtendDirReexportsAndLog(
    first,
    getInterface(),
    dryRun,
  );
}

if (selectedFilesToGenerate.includes('repository')) {
  await writeNewRepositoryFileAndExtendDirReexportsAndLog(
    first,
    getRepo(),
    dryRun,
  );
}

if (selectedFilesToGenerate.includes('DI_Repository')) {
  await writeNewDI_RepoFileAndExtendDirReexportsAndLog(
    first,
    getDI_Repo(),
    dryRun,
  );
}

if (selectedFilesToGenerate.includes('relationMapExtension')) {
  await appendRelationMapMixinToFileAndLog(
    first,
    getRelationMapMixin(),
    dryRun,
    / {2}\/\/ RelationMapValue end token/g,
  );
}

console.log(chalk.cyan(`\n------ executed successfully\n`));
