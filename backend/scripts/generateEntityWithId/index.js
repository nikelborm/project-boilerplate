/* eslint-disable @typescript-eslint/explicit-function-return-type */
// @ts-check
import { camelCase, pascalCase, snakeCase } from 'change-case';
import prompts from 'prompts';
import { appendFile, writeFile } from 'fs/promises';

const { first, dryRun } = await prompts([
  {
    type: 'text',
    name: 'first',
    message: 'First entity name (fully lower case) with space delimiter',
  },
  {
    type: 'toggle',
    name: 'dryRun',
    message: 'Dry run? (skip real writes to file?)',
    initial: false,
    active: 'yes',
    inactive: 'no',
  },
]);

const pascal = pascalCase(first);
const snake = snakeCase(first);
const camel = camelCase(first);

const getModel = () => `import { PrimaryIdentityColumn } from 'src/tools';
import { I${pascal} } from 'src/types';
import { CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity({ name: '${snake}' })
export class ${pascal} implements I${pascal} {
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

console.log(`new ${pascal} model was generated\n`);
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

console.log(`\nnew I${pascal} model interface was generated\n`);
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
