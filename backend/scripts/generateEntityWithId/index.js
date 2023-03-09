/* eslint-disable @typescript-eslint/explicit-function-return-type */
// @ts-check
import { camelCase, pascalCase, snakeCase } from 'change-case';
import prompts from 'prompts';
import { appendFile, writeFile } from 'fs/promises';
import chalk from 'chalk';

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
    ],
    max: 3,
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

const getInterface = () => `export class I${pascal} {
  id!: number;

  createdAt!: Date;

  updatedAt!: Date;
}
`;

const getRepo = () => `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { insertManyPlain, insertOnePlain } from 'src/tools';
import { Repository } from 'typeorm';
import { ${pascal} } from '../model';

@Injectable()
export class ${pascal}Repo {
  constructor(
    @InjectRepository(${pascal})
    private readonly repo: Repository<${pascal}>,
  ) {}

  async getAll(): Promise<SelectedOnePlain${pascal}[]> {
    return await this.repo.find();
  }

  async findOneById(id: number): Promise<SelectedOnePlain${pascal} | null> {
    return await this.repo.findOne({
      where: { id },
    });
  }

  async createOnePlain(
    new${pascal}: Pick<${pascal}, PlainKeysAllowedToModify>,
  ): Promise<CreatedOnePlain${pascal}> {
    return await insertOnePlain<CreatedOnePlain${pascal}>(this.repo, new${pascal});
  }

  async createManyPlain(
    new${pascal}s: Pick<${pascal}, PlainKeysAllowedToModify>[],
  ): Promise<CreatedOnePlain${pascal}[]> {
    return await insertManyPlain<CreatedOnePlain${pascal}>(this.repo, new${pascal}s);
  }

  async updateOnePlain({
    id,
    ...existing${pascal}
  }: UpdatedOnePlain${pascal}): Promise<UpdatedOnePlain${pascal}> {
    await this.repo.update(id, existing${pascal});
    return { id, ...existing${pascal} };
  }

  async updateManyPlain(
    existing${pascal}s: UpdatedOnePlain${pascal}[],
  ): Promise<UpdatedOnePlain${pascal}[]> {
    const updated${pascal}s = await this.repo.save(existing${pascal}s);
    return updated${pascal}s;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}

type PrimaryKeys = 'id';
type PlainKeysGeneratedAfterInsert = PrimaryKeys | 'createdAt' | 'updatedAt';

type PlainKeysAllowedToModify = RegularPlainKeys;

type UsuallyReturned${pascal}PlainKeys =
  | PlainKeysGeneratedAfterInsert
  | RegularPlainKeys;

type RegularPlainKeys = never;

export type CreatedOnePlain${pascal} = Pick<
  ${pascal},
  PlainKeysAllowedToModify | PlainKeysGeneratedAfterInsert
>;

export type UpdatedOnePlain${pascal} = Pick<${pascal}, PrimaryKeys> &
  Partial<Pick<${pascal}, PlainKeysAllowedToModify>>;

export type SelectedOnePlain${pascal} = Pick<${pascal}, UsuallyReturned${pascal}PlainKeys>;
`;

if (selectedFilesToGenerate.includes('databaseModel')) {
  console.log(chalk.cyan(`\n------ new ${pascal} model was generated\n`));
  console.log(getModel());

  if (!dryRun) {
    await writeFile(
      `./backend/src/modules/infrastructure/model/${camel}.model.ts`,
      getModel(),
    );
    await appendFile(
      `./backend/src/modules/infrastructure/model/index.ts`,
      `export * from './${camel}.model';\n`,
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
    await appendFile(
      `./shared/src/types/shared/model/index.ts`,
      `export * from './${camel}.model';\n`,
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
    await appendFile(
      `./backend/src/modules/infrastructure/repo/index.ts`,
      `export * from './${camel}.repo';\n`,
    );
  }
}

console.log(chalk.cyan(`\n------ executed successfully\n`));
