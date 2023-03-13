/* eslint-disable @typescript-eslint/explicit-function-return-type */
// @ts-check
import { camelCase, pascalCase, snakeCase } from 'change-case';
import prompts from 'prompts';
import { appendFile, writeFile } from 'fs/promises';
import chalk from 'chalk';
import { writeNewFileWithMixin } from '../writeNewFileWithMixin/index.js';

const { first, second, dryRun, selectedFilesToGenerate } = await prompts([
  {
    type: 'text',
    name: 'first',
    message: 'First entity name (fully lower case) with space delimiter',
  },
  {
    type: 'text',
    name: 'second',
    message: 'Second entity name (fully lower case) with space delimiter',
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
      {
        title: 'Model and interfaces',
        value: 'databaseModelAndInterfaces',
        selected: true,
      },
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

const firstPascal = pascalCase(first);
const firstSnake = snakeCase(first);
const firstCamel = camelCase(first);

const secondPascal = pascalCase(second);
const secondSnake = snakeCase(second);
const secondCamel = camelCase(second);

const getIntermediateModel =
  () => `import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ${secondPascal}, ${firstPascal} } from '.';
import type { I${firstPascal}To${secondPascal} } from 'src/types';

@Entity({ name: '${firstSnake}_to_${secondSnake}' })
export class ${firstPascal}To${secondPascal} implements I${firstPascal}To${secondPascal} {
  @ManyToOne(
    () => ${firstPascal},
    (${firstCamel}) => ${firstCamel}.${firstCamel}To${secondPascal}Relations,
  )
  @JoinColumn({ name: '${firstSnake}_id' })
  ${firstCamel}!: ${firstPascal};

  @Column({
    name: '${firstSnake}_id',
    primary: true,
    nullable: false,
  })
  ${firstCamel}Id!: number;

  @ManyToOne(
    () => ${secondPascal},
    (${secondCamel}) => ${secondCamel}.${firstCamel}To${secondPascal}Relations,
  )
  @JoinColumn({ name: '${secondSnake}_id' })
  ${secondCamel}!: ${secondPascal};

  @Column({
    name: '${secondSnake}_id',
    primary: true,
    nullable: false,
  })
  ${secondCamel}Id!: number;
}
`;

const getIntermediateModelInterface =
  () => `import type { I${secondPascal}, I${firstPascal} } from '.';

export class I${firstPascal}To${secondPascal} {
  ${firstCamel}!: I${firstPascal};

  ${firstCamel}Id!: number;

  ${secondCamel}!: I${secondPascal};

  ${secondCamel}Id!: number;
}
`;

const getIntermediateModelRepo =
  () => `import { Injectable } from '@nestjs/common';
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
import { ${firstPascal}To${secondPascal} } from '../model';

@Injectable()
export class ${firstPascal}To${secondPascal}Repo {
  constructor(
    @InjectRepository(${firstPascal}To${secondPascal})
    private readonly repo: Repository<${firstPascal}To${secondPascal}>,
  ) {}

  getAll = getAllEntities(this.repo)<Config>();

  findOneByIdentity = findOnePlainByIdentity(this.repo)<Config>();

  createOnePlain = createOnePlain(this.repo)<Config>();
  createManyPlain = createManyPlain(this.repo)<Config>();

  updateManyPlain = updateManyPlain(this.repo)<Config>();
  updateOnePlain = updateOnePlain(this.repo)<Config>();

  updateManyWithRelations = updateManyWithRelations(this.repo)<Config>();
  updateOneWithRelations = updateOneWithRelations(this.repo)<Config>();

  deleteOne = deleteEntityByIdentity(this.repo)<Config>();
}

type RepoTypes = EntityRepoMethodTypes<
  ${firstPascal}To${secondPascal},
  {
    EntityName: '${firstPascal}To${secondPascal}';
    OptionalToCreateRegularPlainKeys: null;
    RequiredToCreateRegularPlainKeys: null;

    ForbiddenToCreateGeneratedPlainKeys: null;
    ForbiddenToUpdatePlainKeys: '${firstCamel}Id' | '${secondCamel}Id';
    ForbiddenToUpdateRelationKeys: null;
    UnselectedByDefaultPlainKeys: null;
  }
>;

type Config = RepoTypes['Config'];
`;

const getFirstModelMixin = () => `
  @ManyToMany(
    () => ${secondPascal},
    (${secondCamel}) => ${secondCamel}.${firstCamel}sWithThat${secondPascal},
  )
  @JoinTable({
    name: '${firstSnake}_to_${secondSnake}',
    joinColumn: { name: '${firstSnake}_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: '${secondSnake}_id', referencedColumnName: 'id' },
    // synchronize is important flag! Without it your migrations will have two conflicting declarations for question_to_category table
    // from https://github.com/typeorm/typeorm/blob/master/docs/decorator-reference.md#jointable
    synchronize: false,
  })
  ${secondCamel}s!: ${secondPascal}[];

  @OneToMany(
    () => ${firstPascal}To${secondPascal},
    (${firstCamel}To${secondPascal}) => ${firstCamel}To${secondPascal}.${firstCamel},
  )
  ${firstCamel}To${secondPascal}Relations!: ${firstPascal}To${secondPascal}[];
`;

const getFirstModelImportMixin = () => `
import { ${secondPascal}, ${firstPascal}To${secondPascal} } from '.';`;

const getFirstInterfaceImportMixin = () => `
import type { I${secondPascal}, I${firstPascal}To${secondPascal} } from '.';`;

const getSecondModelMixin = () => `
  @ManyToMany(
    () => ${firstPascal},
    (${firstCamel}) => ${firstCamel}.${secondCamel}s,
  )
  ${firstCamel}sWithThat${secondPascal}!: ${firstPascal}[];

  @OneToMany(
    () => ${firstPascal}To${secondPascal},
    (${firstCamel}To${secondPascal}) => ${firstCamel}To${secondPascal}.${secondCamel},
  )
  ${firstCamel}To${secondPascal}Relations!: ${firstPascal}To${secondPascal}[];
`;

const getSecondModelImportMixin = () => `
import { ${firstPascal}, ${firstPascal}To${secondPascal} } from '.';`;

const getSecondInterfaceImportMixin = () => `
import type { I${firstPascal}, I${firstPascal}To${secondPascal} } from '.';`;

const getFirstModelInterfaceMixin = () => `
  ${secondCamel}s!: I${secondPascal}[];

  ${firstCamel}To${secondPascal}Relations!: I${firstPascal}To${secondPascal}[];
`;

const getSecondModelInterfaceMixin = () => `
  ${firstCamel}sWithThat${secondPascal}!: I${firstPascal}[];

  ${firstCamel}To${secondPascal}Relations!: I${firstPascal}To${secondPascal}[];
`;

const getMixinToFirstModelInRelationMap =
  () => `      ${secondCamel}s: ['${secondPascal}'],
      ${firstCamel}To${secondPascal}Relations: ['${firstPascal}To${secondPascal}'],
`;

const getMixinToSecondModelInRelationMap =
  () => `      ${firstCamel}sWithThat${secondPascal}: ['${firstPascal}'],
      ${firstCamel}To${secondPascal}Relations: ['${firstPascal}To${secondPascal}'],
`;

const getIntermediateModelToRelationMapMixin =
  () => `  ${firstPascal}To${secondPascal}: {
    identityKeys: ['${firstCamel}Id', '${secondCamel}Id'],
    relationToEntityNameMap: {
      ${firstCamel}: '${firstPascal}',
      ${secondCamel}: '${secondPascal}',
      // ${firstPascal}To${secondPascal} relationToEntityNameMap token
    },
  },
`;

if (selectedFilesToGenerate.includes('databaseModelAndInterfaces')) {
  console.log(
    chalk.cyan(
      `\n------ new ${firstPascal}To${secondPascal} model was generated\n`,
    ),
  );
  console.log(getIntermediateModel());

  if (!dryRun) {
    await writeFile(
      `./backend/src/modules/infrastructure/model/${firstCamel}To${secondPascal}.model.ts`,
      getIntermediateModel(),
    );
    console.log(
      chalk.gray(
        `\n------ new ${firstPascal}To${secondPascal} model was written to disk:\n`,
      ),
    );
    await appendFile(
      `./backend/src/modules/infrastructure/model/index.ts`,
      `export * from './${firstCamel}To${secondPascal}.model';\n`,
    );
    console.log(
      chalk.gray(
        `\n------ index.ts reexport of ${firstPascal}To${secondPascal} model was written to disk:\n`,
      ),
    );
  }

  console.log(chalk.cyan(`\n------ Mixin for ${firstPascal} model:\n`));
  console.log(getFirstModelMixin());

  if (!dryRun) {
    await writeNewFileWithMixin(
      `./backend/src/modules/infrastructure/model/${firstCamel}.model.ts`,
      getFirstModelMixin(),
      /}\n$/g,
    );
    console.log(
      chalk.gray(`\n------ mixin to ${firstPascal} was written to disk:\n`),
    );
  }

  console.log(chalk.cyan(`\n------ Mixin for ${secondPascal} model:\n`));
  console.log(getSecondModelMixin());

  if (!dryRun) {
    await writeNewFileWithMixin(
      `./backend/src/modules/infrastructure/model/${secondCamel}.model.ts`,
      getSecondModelMixin(),
      /}\n$/g,
    );
    console.log(
      chalk.gray(`\n------ mixin to ${secondPascal} was written to disk:\n`),
    );
  }

  console.log(chalk.cyan(`\n------ Mixin for ${firstPascal} model imports:\n`));
  console.log(getFirstModelImportMixin());

  if (!dryRun) {
    await writeNewFileWithMixin(
      `./backend/src/modules/infrastructure/model/${firstCamel}.model.ts`,
      getFirstModelImportMixin(),
      /\n*@Entity/g,
    );
    console.log(
      chalk.gray(`\n------ mixin to ${firstPascal} was written to disk:\n`),
    );
  }

  console.log(
    chalk.cyan(`\n------ Mixin for ${secondPascal} model imports:\n`),
  );
  console.log(getSecondModelImportMixin());

  if (!dryRun) {
    await writeNewFileWithMixin(
      `./backend/src/modules/infrastructure/model/${secondCamel}.model.ts`,
      getSecondModelImportMixin(),
      /\n*@Entity/g,
    );
    console.log(
      chalk.gray(`\n------ mixin to ${secondPascal} was written to disk:\n`),
    );
  }

  console.log(
    chalk.cyan(
      `\n------ new I${firstPascal}To${secondPascal} model interface was generated:\n`,
    ),
  );
  console.log(getIntermediateModelInterface());

  if (!dryRun) {
    await writeFile(
      `./shared/src/types/shared/model/${firstCamel}To${secondPascal}.model.ts`,
      getIntermediateModelInterface(),
    );
    console.log(
      chalk.gray(
        `\n------ new I${firstPascal}To${secondPascal} model interface was written to disk:\n`,
      ),
    );
    await appendFile(
      `./shared/src/types/shared/model/index.ts`,
      `export * from './${firstCamel}To${secondPascal}.model';\n`,
    );
    console.log(
      chalk.gray(
        `\n------ index.ts reexport of I${firstPascal}To${secondPascal} model interface was written to disk:\n`,
      ),
    );
  }

  console.log(
    chalk.cyan(`\n------ Mixin for I${firstPascal} model interface:\n`),
  );
  console.log(getFirstModelInterfaceMixin());

  if (!dryRun) {
    await writeNewFileWithMixin(
      `./shared/src/types/shared/model/${firstCamel}.model.ts`,
      getFirstModelInterfaceMixin(),
      /}\n$/g,
    );
    console.log(
      chalk.gray(
        `\n------ mixin to I${firstPascal} interface was written to disk:\n`,
      ),
    );
  }

  console.log(
    chalk.cyan(`\n------ Mixin for I${secondPascal} model interface:\n`),
  );
  console.log(getSecondModelInterfaceMixin());

  if (!dryRun) {
    await writeNewFileWithMixin(
      `./shared/src/types/shared/model/${secondCamel}.model.ts`,
      getSecondModelInterfaceMixin(),
      /}\n$/g,
    );
    console.log(
      chalk.gray(
        `\n------ mixin to I${secondPascal} interface was written to disk:\n`,
      ),
    );
  }

  console.log(
    chalk.cyan(`\n------ Mixin for I${firstPascal} model interface imports:\n`),
  );
  console.log(getFirstInterfaceImportMixin());

  if (!dryRun) {
    await writeNewFileWithMixin(
      `./shared/src/types/shared/model/${firstCamel}.model.ts`,
      getFirstInterfaceImportMixin(),
      /\n*export class I/g,
    );
    console.log(
      chalk.gray(
        `\n------ mixin to I${firstPascal} interface was written to disk:\n`,
      ),
    );
  }

  console.log(
    chalk.cyan(
      `\n------ Mixin for I${secondPascal} model interface imports:\n`,
    ),
  );
  console.log(getSecondInterfaceImportMixin());

  if (!dryRun) {
    await writeNewFileWithMixin(
      `./shared/src/types/shared/model/${secondCamel}.model.ts`,
      getSecondInterfaceImportMixin(),
      /\n*export class I/g,
    );
    console.log(
      chalk.gray(
        `\n------ mixin to I${secondPascal} interface was written to disk:\n`,
      ),
    );
  }
}

if (selectedFilesToGenerate.includes('repository')) {
  console.log(
    chalk.cyan(
      `\n------ new ${firstPascal}To${secondPascal}Repo repo was generated\n`,
    ),
  );
  console.log(getIntermediateModelRepo());

  if (!dryRun) {
    await writeFile(
      `./backend/src/modules/infrastructure/repo/${firstCamel}To${secondPascal}.repo.ts`,
      getIntermediateModelRepo(),
    );
    console.log(
      chalk.gray(
        `\n------ new ${firstPascal}To${secondPascal}Repo repo was written to disk:\n`,
      ),
    );
    await appendFile(
      `./backend/src/modules/infrastructure/repo/index.ts`,
      `export * from './${firstCamel}To${secondPascal}.repo';\n`,
    );
    console.log(
      chalk.gray(
        `\n------ index.ts reexport of ${firstPascal}To${secondPascal}Repo repo was written to disk:\n`,
      ),
    );
  }
}

if (selectedFilesToGenerate.includes('relationMapExtension')) {
  console.log(
    chalk.cyan(
      `\n------ Mixin for ${firstPascal}To${secondPascal} in relation map:\n`,
    ),
  );
  console.log(getIntermediateModelToRelationMapMixin());

  if (!dryRun) {
    await writeNewFileWithMixin(
      `./backend/src/types/private/relationMap.ts`,
      getIntermediateModelToRelationMapMixin(),
      /  \/\/ RelationMapValue end token/g,
    );
    console.log(
      chalk.gray(
        `\n------ Mixin for ${firstPascal}To${secondPascal} in relation map was written to disk:\n`,
      ),
    );
  }

  console.log(
    chalk.cyan(`\n------ Mixin for ${firstPascal} in relation map:\n`),
  );
  console.log(getMixinToFirstModelInRelationMap());

  if (!dryRun) {
    await writeNewFileWithMixin(
      `./backend/src/types/private/relationMap.ts`,
      getMixinToFirstModelInRelationMap(),
      new RegExp(
        `      \\/\\/ ${firstPascal} relationToEntityNameMap token`,
        'g',
      ),
    );
    console.log(
      chalk.gray(
        `\n------ Mixin for ${firstPascal} in relation map was written to disk:\n`,
      ),
    );
  }

  console.log(
    chalk.cyan(`\n------ Mixin for ${secondPascal} in relation map:\n`),
  );
  console.log(getMixinToSecondModelInRelationMap());

  if (!dryRun) {
    await writeNewFileWithMixin(
      `./backend/src/types/private/relationMap.ts`,
      getMixinToSecondModelInRelationMap(),
      new RegExp(
        `      \\/\\/ ${secondPascal} relationToEntityNameMap token`,
        'g',
      ),
    );
    console.log(
      chalk.gray(
        `\n------ Mixin for ${secondPascal} in relation map was written to disk:\n`,
      ),
    );
  }
}

console.log(chalk.cyan(`\n------ executed successfully\n`));
