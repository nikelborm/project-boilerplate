/* eslint-disable @typescript-eslint/explicit-function-return-type */
// @ts-check
import { camelCase, pascalCase, snakeCase } from 'change-case';
import prompts from 'prompts';
import { appendFile, writeFile } from 'fs/promises';

const { first, second } = await prompts([
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

@Entity({ name: '${firstSnake}_to_${secondSnake}' })
export class ${firstPascal}To${secondPascal} {
  @ManyToOne(
    () => ${firstPascal},
    (${firstCamel}) => ${firstCamel}.${firstCamel}To${secondPascal}Relations
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

const getFirstModelMixin = () => `
  @ManyToMany(
    () => ${secondPascal},
    (${secondCamel}) => ${secondCamel}.${firstCamel}sWithThat${secondPascal},
  )
  @JoinTable({
    name: '${firstSnake}_to_${secondSnake}',
    joinColumn: { name: '${firstSnake}_id' },
    inverseJoinColumn: { name: '${secondSnake}_id' },
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

const getSecondModelMixin = () => `
  @ManyToMany(
    () => ${firstPascal},
    (${firstCamel}) => ${firstCamel}.${secondCamel}s
  )
  ${firstCamel}sWithThat${secondPascal}!: ${firstPascal}[];

  @OneToMany(
    () => ${firstPascal}To${secondPascal},
    (${firstCamel}To${secondPascal}) => ${firstCamel}To${secondPascal}.${secondCamel},
  )
  ${firstCamel}To${secondPascal}Relations!: ${firstPascal}To${secondPascal}[];
`;

console.log(`new ${firstPascal}To${secondPascal} model was generated\n`);
console.log(getIntermediateModel());
await writeFile(
  `./backend/src/modules/infrastructure/model/${firstCamel}To${secondPascal}.model.ts`,
  getIntermediateModel(),
);
await appendFile(
  `./backend/src/modules/infrastructure/model/index.ts`,
  `export * from './${firstCamel}To${secondPascal}.model';\n`,
);

console.log(`\n------ Mixin for ${firstPascal} model:\n`);
console.log(getFirstModelMixin());
console.log(`\n------ Mixin for ${secondPascal} model:\n`);
console.log(getSecondModelMixin());