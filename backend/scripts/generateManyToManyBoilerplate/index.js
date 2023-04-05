/* eslint-disable @typescript-eslint/restrict-template-expressions */
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
  appendModelBodyMixinToFileAndLog,
  appendModelImportsMixinToFileAndLog,
  appendModelInterfaceBodyMixinToFileAndLog,
  appendModelInterfaceImportsMixinToFileAndLog,
  appendRelationMapMixinToFileAndLog,
  lintBackend,
  typeormModelInjectImport,
  writeNewDI_RepoFileAndExtendDirReexportsAndLog,
  writeNewModelFileAndExtendDirReexportsAndLog,
  writeNewModelInterfaceFileAndExtendDirReexportsAndLog,
  writeNewRepositoryFileAndExtendDirReexportsAndLog,
} from '../common/index.js';

const {
  first,
  second,
  dryRun,
  selectedFilesToGenerate,
  firstCamelMultiple,
  secondCamelMultiple,
  intermediatePascal,
} = await prompts([
  {
    type: 'text',
    name: 'first',
    message: 'First entity name (fully lower case) with space delimiter',
  },
  {
    type: 'text',
    name: 'firstCamelMultiple',
    message: 'firstCamel multiple form:',
    initial: (prev) => `${camelCase(prev)}s`,
  },
  {
    type: 'text',
    name: 'second',
    message: 'Second entity name (fully lower case) with space delimiter',
  },
  {
    type: 'text',
    name: 'secondCamelMultiple',
    message: 'secondCamel multiple form:',
    initial: (prev) => `${camelCase(prev)}s`,
  },
  {
    type: 'text',
    name: 'intermediatePascal',
    message: 'Intermediate pascal entity name',
    initial: (prev, values) =>
      `${pascalCase(values.first)}To${pascalCase(values.second)}`,
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

const firstPascal = pascalCase(first);
const firstSnake = snakeCase(first);
const firstCamel = camelCase(first);

const secondPascal = pascalCase(second);
const secondSnake = snakeCase(second);
const secondCamel = camelCase(second);

const intermediateCamel = camelCase(intermediatePascal);
const intermediateSnake = snakeCase(intermediatePascal);

const getIntermediateModel =
  () => `/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ${secondPascal}, ${firstPascal} } from '.';
${
  selectedFilesToGenerate.includes('interfaces')
    ? `import type { I${intermediatePascal} } from 'src/types';`
    : ''
}

@Entity({ name: '${intermediateSnake}' })
export class ${intermediatePascal} ${
    selectedFilesToGenerate.includes('interfaces')
      ? `implements I${intermediatePascal} `
      : ''
  }{
  @ManyToOne(
    () => ${firstPascal},
    (${firstCamel}) => ${firstCamel}.${intermediateCamel}Relations,
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
    (${secondCamel}) => ${secondCamel}.${intermediateCamel}Relations,
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

export class I${intermediatePascal} {
  ${firstCamel}!: I${firstPascal};

  ${firstCamel}Id!: number;

  ${secondCamel}!: I${secondPascal};

  ${secondCamel}Id!: number;
}
`;

const getIntermediateModelRepo =
  () => `import { Injectable, type Provider } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DefaultEntityWithIdentityRepoImplementation } from 'src/tools';
import { Repository } from 'typeorm';
import {
  DI_${intermediatePascal}Repo,
  type RepoTypes,
} from '../di/${intermediateCamel}.repo.di';
import { ${intermediatePascal} } from '../model';

@Injectable()
class ${intermediatePascal}Repo
  extends DefaultEntityWithIdentityRepoImplementation<RepoTypes>
  implements DI_${intermediatePascal}Repo
{
  constructor(
    @InjectRepository(${intermediatePascal})
    protected override readonly repo: Repository<${intermediatePascal}>,
  ) {
    super(repo);
  }
}

export const ${intermediatePascal}RepoDIProvider: Provider = {
  provide: DI_${intermediatePascal}Repo,
  useClass: ${intermediatePascal}Repo,
};
`;

const getIntermediateModelDI_Repo = () => `import {
  type EntityRepoMethodTypes,
  type I${intermediatePascal},
  IDefaultIdentityRepo,
} from 'src/types';

export abstract class DI_${intermediatePascal}Repo extends IDefaultIdentityRepo<RepoTypes> {}

export type RepoTypes = EntityRepoMethodTypes<
  I${intermediatePascal},
  {
    EntityName: '${intermediatePascal}';

    RequiredToCreateAndSelectRegularPlainKeys: '${firstCamel}Id' | '${secondCamel}Id';

    OptionalToCreateAndSelectRegularPlainKeys: null;

    ForbiddenToCreateGeneratedPlainKeys: null;
    ForbiddenToUpdatePlainKeys: '${firstCamel}Id' | '${secondCamel}Id';
    ForbiddenToUpdateRelationKeys: null;
    UnselectedByDefaultPlainKeys: null;
  }
>;
`;

const getFirstModelMixin = () => `
  @ManyToMany(
    () => ${secondPascal},
    (${secondCamel}) => ${secondCamel}.${firstCamelMultiple}WithThat${secondPascal},
  )
  @JoinTable({
    name: '${intermediateSnake}',
    joinColumn: { name: '${firstSnake}_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: '${secondSnake}_id', referencedColumnName: 'id' },
    // synchronize is important flag! Without it your migrations will have two conflicting declarations for question_to_category table
    // from https://github.com/typeorm/typeorm/blob/master/docs/decorator-reference.md#jointable
    synchronize: false,
  })
  ${secondCamelMultiple}!: ${secondPascal}[];

  @OneToMany(
    () => ${intermediatePascal},
    (${intermediateCamel}) => ${intermediateCamel}.${firstCamel},
  )
  ${intermediateCamel}Relations!: ${intermediatePascal}[];
`;

const getFirstModelImportMixin = () => `
import { ${secondPascal}, ${intermediatePascal} } from '.';`;

const getFirstInterfaceImportMixin = () => `
import type { I${secondPascal}, I${intermediatePascal} } from '.';`;

const getSecondModelMixin = () => `
  @ManyToMany(
    () => ${firstPascal},
    (${firstCamel}) => ${firstCamel}.${secondCamelMultiple},
  )
  ${firstCamelMultiple}WithThat${secondPascal}!: ${firstPascal}[];

  @OneToMany(
    () => ${intermediatePascal},
    (${intermediateCamel}) => ${intermediateCamel}.${secondCamel},
  )
  ${intermediateCamel}Relations!: ${intermediatePascal}[];
`;

const getSecondModelImportMixin = () => `
import { ${firstPascal}, ${intermediatePascal} } from '.';`;

const getSecondInterfaceImportMixin = () => `
import type { I${firstPascal}, I${intermediatePascal} } from '.';`;

const getFirstModelInterfaceMixin = () => `
  ${secondCamelMultiple}!: I${secondPascal}[];

  ${intermediateCamel}Relations!: I${intermediatePascal}[];
`;

const getSecondModelInterfaceMixin = () => `
  ${firstCamelMultiple}WithThat${secondPascal}!: I${firstPascal}[];

  ${intermediateCamel}Relations!: I${intermediatePascal}[];
`;

const getMixinToFirstModelInRelationMap =
  () => `      ${secondCamelMultiple}: ['${secondPascal}'],
      ${intermediateCamel}Relations: ['${intermediatePascal}'],
`;

const getMixinToSecondModelInRelationMap =
  () => `      ${firstCamelMultiple}WithThat${secondPascal}: ['${firstPascal}'],
      ${intermediateCamel}Relations: ['${intermediatePascal}'],
`;

const getIntermediateModelToRelationMapMixin = () => `  ${intermediatePascal}: {
    identityKeys: ['${firstCamel}Id', '${secondCamel}Id'],
    relationToEntityNameMap: {
      ${firstCamel}: '${firstPascal}',
      ${secondCamel}: '${secondPascal}',
      // ${intermediatePascal} relationToEntityNameMap token
    },
  },
`;

if (selectedFilesToGenerate.includes('models')) {
  await writeNewModelFileAndExtendDirReexportsAndLog(
    `${intermediatePascal}`,
    getIntermediateModel(),
    dryRun,
  );

  await typeormModelInjectImport(dryRun, 'ManyToMany', first);
  await typeormModelInjectImport(dryRun, 'JoinTable', first);
  await typeormModelInjectImport(dryRun, 'OneToMany', first);
  await appendModelBodyMixinToFileAndLog(first, getFirstModelMixin(), dryRun);

  await typeormModelInjectImport(dryRun, 'ManyToMany', second);
  await typeormModelInjectImport(dryRun, 'OneToMany', second);
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
    `${intermediatePascal}`,
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
    `${intermediatePascal}`,
    getIntermediateModelRepo(),
    dryRun,
  );
}

if (selectedFilesToGenerate.includes('DI_Repository')) {
  await writeNewDI_RepoFileAndExtendDirReexportsAndLog(
    `${intermediatePascal}`,
    getIntermediateModelDI_Repo(),
    dryRun,
  );
}

if (selectedFilesToGenerate.includes('relationMapExtension')) {
  await appendRelationMapMixinToFileAndLog(
    `${intermediatePascal}`,
    getIntermediateModelToRelationMapMixin(),
    dryRun,
    / {2}\/\/ RelationMapValue end token/g,
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

await lintBackend(dryRun);

console.log(chalk.cyan(`\n------ executed successfully\n`));
