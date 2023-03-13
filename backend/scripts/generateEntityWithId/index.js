/* eslint-disable @typescript-eslint/explicit-function-return-type */
// @ts-check
import { camelCase, pascalCase, snakeCase } from 'change-case';
import prompts from 'prompts';
import { appendFile, writeFile } from 'fs/promises';
import chalk from 'chalk';
import { writeNewFileWithMixin } from '../writeNewFileWithMixin/index.js';

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
const camel = camelCase(first);

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
  ): Promise<RepoTypes['SelectedOnePlainEntity'] | null> =>
    await findOnePlainByIdentity(this.repo)<Config>()({ id });

  createOnePlain = createOnePlain(this.repo)<Config>();
  createManyPlain = createManyPlain(this.repo)<Config>();

  updateManyPlain = updateManyPlain(this.repo)<Config>();
  updateOnePlain = updateOnePlain(this.repo)<Config>();

  updateManyWithRelations = updateManyWithRelations(this.repo)<Config>();
  updateOneWithRelations = updateOneWithRelations(this.repo)<Config>();

  deleteOneById = async (id: number): Promise<void> =>
    await deleteEntityByIdentity(this.repo)<Config>()({ id });
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
`;

if (selectedFilesToGenerate.includes('databaseModel')) {
  console.log(chalk.cyan(`\n------ new ${pascal} model was generated\n`));
  console.log(getModel());

  if (!dryRun) {
    await writeFile(
      `./backend/src/modules/infrastructure/model/${camel}.model.ts`,
      getModel(),
    );
    console.log(
      chalk.gray(`\n------ new ${pascal} model was written to disk:\n`),
    );
    await appendFile(
      `./backend/src/modules/infrastructure/model/index.ts`,
      `export * from './${camel}.model';\n`,
    );
    console.log(
      chalk.gray(
        `\n------ index.ts reexport of ${pascal} model was written to disk:\n`,
      ),
    );
  }
}

if (selectedFilesToGenerate.includes('interface')) {
  console.log(chalk.cyan(`\n------ new I${pascal} interface was generated\n`));
  console.log(getInterface());

  if (!dryRun) {
    await writeFile(
      `./shared/src/types/shared/model/${camel}.model.ts`,
      getInterface(),
    );
    console.log(
      chalk.gray(`\n------ new I${pascal} interface was written to disk:\n`),
    );
    await appendFile(
      `./shared/src/types/shared/model/index.ts`,
      `export * from './${camel}.model';\n`,
    );
    console.log(
      chalk.gray(
        `\n------ index.ts reexport of I${pascal} interface was written to disk:\n`,
      ),
    );
  }
}

if (selectedFilesToGenerate.includes('repository')) {
  console.log(chalk.cyan(`\n------ new ${pascal}Repo repo was generated\n`));
  console.log(getRepo());

  if (!dryRun) {
    await writeFile(
      `./backend/src/modules/infrastructure/repo/${camel}.repo.ts`,
      getRepo(),
    );
    console.log(
      chalk.gray(
        `\n------ new ${pascal}Repo repository was written to disk:\n`,
      ),
    );
    await appendFile(
      `./backend/src/modules/infrastructure/repo/index.ts`,
      `export * from './${camel}.repo';\n`,
    );
    console.log(
      chalk.gray(
        `\n------ index.ts reexport of ${pascal}Repo repository was written to disk:\n`,
      ),
    );
  }
}

if (selectedFilesToGenerate.includes('relationMapExtension')) {
  console.log(chalk.cyan(`\n------ Mixin for ${pascal} in relation map:\n`));
  console.log(getRelationMapMixin());

  if (!dryRun) {
    await writeNewFileWithMixin(
      `./backend/src/types/private/relationMap.ts`,
      getRelationMapMixin(),
      /  \/\/ RelationMapValue end token/g,
    );
    console.log(
      chalk.gray(
        `\n------ Mixin for ${pascal} in relation map was written to disk:\n`,
      ),
    );
  }
}

console.log(chalk.cyan(`\n------ executed successfully\n`));
