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
} from '../common/index.js';

const { first, second, dryRun, selectedFilesToGenerate, firstCamelMultiple } =
  await prompts([
    {
      type: 'text',
      name: 'first',
      message: 'Many entities name (fully lower case) with space delimiter',
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
      message: 'To one entity name (fully lower case) with space delimiter',
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
          title: 'Model mixins',
          value: 'modelMixins',
          selected: true,
        },
        {
          title: 'Model interface mixins',
          value: 'modelInterfaceMixins',
          selected: true,
        },
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
const firstCamel = camelCase(first);

const secondPascal = pascalCase(second);
const secondSnake = snakeCase(second);
const secondCamel = camelCase(second);

const getMixinToMultipleSideOfRelation = () => `
  @ManyToOne(() => ${secondPascal}, (${secondCamel}) => ${secondCamel}.${firstCamelMultiple})
  @JoinColumn({ name: '${secondSnake}_id' })
  ${secondCamel}!: ${secondPascal};

  @Column({
    name: '${secondSnake}_id',
    nullable: false,
  })
  ${secondCamel}Id!: number;
`;

const getMixinToMultipleSideEntityInRelationMap =
  () => `      ${secondCamel}: '${secondPascal}',
`;

const getMixinToSingleSideEntityInRelationMap =
  () => `      ${firstCamelMultiple}: ['${firstPascal}'],
`;

const getMixinToSingleSideOfRelation = () => `
  @OneToMany(
    () => ${firstPascal},
    (${firstCamel}) => ${firstCamel}.${secondCamel},
  )
  ${firstCamelMultiple}!: ${firstPascal}[];
`;

const getMixinToMultipleSideOfRelationInterface = () => `
  ${secondCamel}!: I${secondPascal};

  ${secondCamel}Id!: number;
`;

const getMixinToSingleSideOfRelationInterface = () => `
  ${firstCamelMultiple}!: I${firstPascal}[];
`;

const getFirstModelImportMixin = () => `
import { ${secondPascal} } from '.';`;

const getFirstInterfaceImportMixin = () => `
import type { I${secondPascal} } from '.';`;

const getSecondModelImportMixin = () => `
import { ${firstPascal} } from '.';`;

const getSecondInterfaceImportMixin = () => `
import type { I${firstPascal} } from '.';`;

if (selectedFilesToGenerate.includes('modelMixins')) {
  await typeormModelInjectImport(dryRun, 'ManyToOne', first);
  await typeormModelInjectImport(dryRun, 'JoinColumn', first);
  await typeormModelInjectImport(dryRun, 'Column', first);
  await appendModelBodyMixinToFileAndLog(
    first,
    getMixinToMultipleSideOfRelation(),
    dryRun,
  );

  await typeormModelInjectImport(dryRun, 'OneToMany', second);
  await appendModelBodyMixinToFileAndLog(
    second,
    getMixinToSingleSideOfRelation(),
    dryRun,
  );

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

if (selectedFilesToGenerate.includes('modelInterfaceMixins')) {
  await appendModelInterfaceBodyMixinToFileAndLog(
    first,
    getMixinToMultipleSideOfRelationInterface(),
    dryRun,
  );

  await appendModelInterfaceBodyMixinToFileAndLog(
    second,
    getMixinToSingleSideOfRelationInterface(),
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

if (selectedFilesToGenerate.includes('relationMapExtension')) {
  await appendRelationMapMixinToFileAndLog(
    first,
    getMixinToMultipleSideEntityInRelationMap(),
    dryRun,
    new RegExp(
      `      \\/\\/ ${firstPascal} relationToEntityNameMap token`,
      'g',
    ),
  );

  await appendRelationMapMixinToFileAndLog(
    second,
    getMixinToSingleSideEntityInRelationMap(),
    dryRun,
    new RegExp(
      `      \\/\\/ ${secondPascal} relationToEntityNameMap token`,
      'g',
    ),
  );
}

await lintBackend(dryRun);

console.log(chalk.cyan(`\n------ executed successfully\n`));
