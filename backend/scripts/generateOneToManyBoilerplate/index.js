/* eslint-disable @typescript-eslint/explicit-function-return-type */
// @ts-check
import { camelCase, pascalCase, snakeCase } from 'change-case';
import prompts from 'prompts';
import chalk from 'chalk';
import { writeNewFileWithMixin } from '../writeNewFileWithMixin/index.js';

const { first, second, dryRun, selectedFilesToGenerate } = await prompts([
  {
    type: 'text',
    name: 'first',
    message: 'Many entities name (fully lower case) with space delimiter',
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
        title: 'Usual mixins',
        value: 'usualMixins',
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
  @ManyToOne(() => ${secondPascal}, (${secondCamel}) => ${secondCamel}.${firstCamel}s)
  @JoinColumn({ name: '${secondSnake}_id' })
  ${secondCamel}!: ${secondPascal};

  @Column({
    name: '${secondSnake}_id',
    nullable: false,
  })
  ${secondCamel}Id!: number;
`;

const getMixinToMultipleSideEntityInRelationMap =
  () => `${secondCamel}: '${secondPascal}',
`;

const getMixinToSingleSideEntityInRelationMap =
  () => `${firstCamel}: ['${firstPascal}'],
`;

const getMixinToSingleSideOfRelation = () => `
  @OneToMany(
    () => ${firstPascal},
    (${firstCamel}) => ${firstCamel}.${secondCamel},
  )
  ${firstCamel}s!: ${firstPascal}[];
`;

const getMixinToMultipleSideOfRelationInterface = () => `
  ${secondCamel}!: I${secondPascal};

  ${secondCamel}Id!: number;
`;

const getMixinToSingleSideOfRelationInterface = () => `
  ${firstCamel}s!: I${firstPascal}[];
`;

if (selectedFilesToGenerate.includes('usualMixins')) {
  console.log(chalk.cyan(`\n------ Mixin for ${firstPascal} model:\n`));
  console.log(getMixinToMultipleSideOfRelation());

  if (!dryRun) {
    await writeNewFileWithMixin(
      `./backend/src/modules/infrastructure/model/${firstCamel}.model.ts`,
      getMixinToMultipleSideOfRelation(),
      /}\n$/g,
    );
    console.log(
      chalk.gray(`\n------ mixin to ${firstPascal} was written to disk:\n`),
    );
  }
  console.log(chalk.cyan(`\n------ Mixin for ${secondPascal} model:\n`));
  console.log(getMixinToSingleSideOfRelation());

  if (!dryRun) {
    await writeNewFileWithMixin(
      `./backend/src/modules/infrastructure/model/${secondCamel}.model.ts`,
      getMixinToSingleSideOfRelation(),
      /}\n$/g,
    );
    console.log(
      chalk.gray(`\n------ mixin to ${secondPascal} was written to disk:\n`),
    );
  }
  console.log(
    chalk.cyan(`\n------ Mixin for I${firstPascal} model interface:\n`),
  );
  console.log(getMixinToMultipleSideOfRelationInterface());

  if (!dryRun) {
    await writeNewFileWithMixin(
      `./shared/src/types/shared/model/${firstCamel}.model.ts`,
      getMixinToMultipleSideOfRelationInterface(),
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
  console.log(getMixinToSingleSideOfRelationInterface());

  if (!dryRun) {
    await writeNewFileWithMixin(
      `./shared/src/types/shared/model/${secondCamel}.model.ts`,
      getMixinToSingleSideOfRelationInterface(),
      /}\n$/g,
    );
    console.log(
      chalk.gray(
        `\n------ mixin to I${secondPascal} interface was written to disk:\n`,
      ),
    );
  }
}

if (selectedFilesToGenerate.includes('relationMapExtension')) {
  console.log(
    chalk.cyan(`\n------ Mixin for ${firstPascal} in relation map:\n`),
  );
  console.log(getMixinToMultipleSideEntityInRelationMap());

  if (!dryRun) {
    await writeNewFileWithMixin(
      `./backend/src/types/private/relationMap.ts`,
      getMixinToMultipleSideEntityInRelationMap(),
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
  console.log(getMixinToSingleSideEntityInRelationMap());

  if (!dryRun) {
    await writeNewFileWithMixin(
      `./backend/src/types/private/relationMap.ts`,
      getMixinToSingleSideEntityInRelationMap(),
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
