/* eslint-disable @typescript-eslint/explicit-function-return-type */
// @ts-check
import { pascalCase, snakeCase } from 'change-case';
import prompts from 'prompts';
import chalk from 'chalk';
import {
  appendRelationMapMixinToFileAndLog,
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

const getModel = () => `import { PrimaryIdentityColumn } from 'src/tools';
${
  selectedFilesToGenerate.includes('interface')
    ? `import type { I${pascal} } from 'src/types';`
    : ''
}
import { CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity({ name: '${snake}' })
export class ${pascal} ${
  selectedFilesToGenerate.includes('interface') ? `implements I${pascal} ` : ''
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

const getRepo = () => `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  createManyPlain,
  createOnePlain,
  deleteEntityByIdentity,
  deleteManyEntitiesByIdentities,
  findManyPlainByIdentities,
  findOnePlainByIdentity,
  getAllEntities,
  updateManyPlain,
  updateManyWithRelations,
  updateOnePlain,
  updateOneWithRelations,
} from 'src/tools';
import type { EntityRepoMethodTypes } from 'src/types';
import { Repository } from 'typeorm';
import { ${pascal} } from '../model';

@Injectable()
export class ${pascal}Repo {
  constructor(
    @InjectRepository(${pascal})
    private readonly repo: Repository<${pascal}>,
  ) {}

  getAll = getAllEntities(this.repo)<Config>();

  findOneById = async (
    id: number,
  ): Promise<RepoTypes['Public']['SelectedOnePlainEntity'] | null> =>
    await findOnePlainByIdentity(this.repo)<Config>()({ id });

  findManyByIds = async (
    ids: number[],
  ): Promise<RepoTypes['Public']['SelectedOnePlainEntity'][]> =>
    await findManyPlainByIdentities(this.repo)<Config>()(
      ids.map((id) => ({ id })),
    );

  createOnePlain = createOnePlain(this.repo)<Config>();
  createManyPlain = createManyPlain(this.repo)<Config>();

  updateManyPlain = updateManyPlain(this.repo)<Config>();
  updateOnePlain = updateOnePlain(this.repo)<Config>();

  updateManyWithRelations = updateManyWithRelations(this.repo)<Config>();
  updateOneWithRelations = updateOneWithRelations(this.repo)<Config>();

  deleteOneById = async (id: number): Promise<void> =>
    await deleteEntityByIdentity(this.repo)<Config>()({ id });

  deleteManyByIds = async (ids: number[]): Promise<void> =>
    await deleteManyEntitiesByIdentities(this.repo)<Config>()(
      ids.map((id) => ({ id })),
    );
}

type RepoTypes = EntityRepoMethodTypes<
  ${pascal},
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

type Config = RepoTypes['Config'];

export type ${pascal}PublicRepoTypes = RepoTypes['Public'];
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

if (selectedFilesToGenerate.includes('relationMapExtension')) {
  await appendRelationMapMixinToFileAndLog(
    first,
    getRelationMapMixin(),
    dryRun,
    /  \/\/ RelationMapValue end token/g,
  );
}

console.log(chalk.cyan(`\n------ executed successfully\n`));
