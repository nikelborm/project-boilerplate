/* eslint-disable @typescript-eslint/explicit-function-return-type */
// @ts-check
import { camelCase, pascalCase, snakeCase } from 'change-case';
import prompts from 'prompts';
import chalk from 'chalk';
import { readFile, writeFile } from 'fs/promises';

const { first, second, dryRun } = await prompts([
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
]);

const firstPascal = pascalCase(first);
const firstCamel = camelCase(first);

const secondPascal = pascalCase(second);
const secondSnake = snakeCase(second);
const secondCamel = camelCase(second);

const writeNewFileWithMixin = async (filename, mixin) => {
  const regex = /}\n$/gm;
  let tsFileContent = (await readFile(filename)).toString();

  let { index } = [...tsFileContent.matchAll(regex)][0];
  if (!index) throw new Error('regex was not found');

  const updatedFile = `${tsFileContent.slice(
    0,
    index,
  )}${mixin}${tsFileContent.slice(index)}`;

  await writeFile(filename, updatedFile);
};

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

console.log(chalk.cyan(`\n------ Mixin for ${firstPascal} model:\n`));
console.log(getMixinToMultipleSideOfRelation());

if (!dryRun) {
  await writeNewFileWithMixin(
    `./backend/src/modules/infrastructure/model/${firstCamel}.model.ts`,
    getMixinToMultipleSideOfRelation(),
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
  );
  console.log(
    chalk.gray(
      `\n------ mixin to I${secondPascal} interface was written to disk:\n`,
    ),
  );
}
console.log(chalk.cyan(`\n------ executed successfully\n`));
