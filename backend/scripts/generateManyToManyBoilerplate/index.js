/* eslint-disable @typescript-eslint/explicit-function-return-type */
// @ts-check
import { camelCase, pascalCase, snakeCase } from 'change-case';
import prompts from 'prompts';
import chalk from 'chalk';
import {
  appendModelBodyMixinToFileAndLog,
  appendModelImportsMixinToFileAndLog,
  appendModelInterfaceBodyMixinToFileAndLog,
  appendModelInterfaceImportsMixinToFileAndLog,
  appendRelationMapMixinToFileAndLog,
  writeNewModelFileAndExtendDirReexportsAndLog,
  writeNewModelInterfaceFileAndExtendDirReexportsAndLog,
  writeNewRepositoryFileAndExtendDirReexportsAndLog,
} from '../common/index.js';

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
        title: 'Models',
        value: 'models',
        selected: true,
      },
      {
        title: 'Interfaces',
        value: 'interfaces',
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
${
  selectedFilesToGenerate.includes('interfaces')
    ? `import type { I${firstPascal}To${secondPascal} } from 'src/types';`
    : ''
}

@Entity({ name: '${firstSnake}_to_${secondSnake}' })
export class ${firstPascal}To${secondPascal} ${
    selectedFilesToGenerate.includes('interfaces')
      ? `implements I${firstPascal}To${secondPascal} `
      : ''
  }{
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

    RequiredToCreateAndSelectRegularPlainKeys: '${firstCamel}Id' | '${secondCamel}Id';

    OptionalToCreateAndSelectRegularPlainKeys: null;

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

if (selectedFilesToGenerate.includes('models')) {
  await writeNewModelFileAndExtendDirReexportsAndLog(
    `${firstPascal}To${secondPascal}`,
    getIntermediateModel(),
    dryRun,
  );

  await appendModelBodyMixinToFileAndLog(first, getFirstModelMixin(), dryRun);

  await appendModelBodyMixinToFileAndLog(second, getSecondModelMixin(), dryRun);

  await appendModelImportsMixinToFileAndLog(
    first,
    getFirstModelImportMixin(),
    dryRun,
  );

  await appendModelImportsMixinToFileAndLog(
    second,
    getSecondModelImportMixin(),
    dryRun,
  );
}

if (selectedFilesToGenerate.includes('interfaces')) {
  await writeNewModelInterfaceFileAndExtendDirReexportsAndLog(
    `${firstPascal}To${secondPascal}`,
    getIntermediateModelInterface(),
    dryRun,
  );

  await appendModelInterfaceBodyMixinToFileAndLog(
    first,
    getFirstModelInterfaceMixin(),
    dryRun,
  );

  await appendModelInterfaceBodyMixinToFileAndLog(
    second,
    getSecondModelInterfaceMixin(),
    dryRun,
  );

  await appendModelInterfaceImportsMixinToFileAndLog(
    first,
    getFirstInterfaceImportMixin(),
    dryRun,
  );

  await appendModelInterfaceImportsMixinToFileAndLog(
    second,
    getSecondInterfaceImportMixin(),
    dryRun,
  );
}

if (selectedFilesToGenerate.includes('repository')) {
  await writeNewRepositoryFileAndExtendDirReexportsAndLog(
    `${firstPascal}To${secondPascal}`,
    getIntermediateModelRepo(),
    dryRun,
  );
}

if (selectedFilesToGenerate.includes('relationMapExtension')) {
  await appendRelationMapMixinToFileAndLog(
    `${firstPascal}To${secondPascal}`,
    getIntermediateModelToRelationMapMixin(),
    dryRun,
    /  \/\/ RelationMapValue end token/g,
  );

  await appendRelationMapMixinToFileAndLog(
    first,
    getMixinToFirstModelInRelationMap(),
    dryRun,
    new RegExp(
      `      \\/\\/ ${firstPascal} relationToEntityNameMap token`,
      'g',
    ),
  );

  await appendRelationMapMixinToFileAndLog(
    second,
    getMixinToSecondModelInRelationMap(),
    dryRun,
    new RegExp(
      `      \\/\\/ ${secondPascal} relationToEntityNameMap token`,
      'g',
    ),
  );
}

console.log(chalk.cyan(`\n------ executed successfully\n`));
