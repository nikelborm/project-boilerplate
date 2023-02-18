/* eslint-disable @typescript-eslint/explicit-function-return-type */
// @ts-check
import { camelCase, pascalCase, snakeCase } from 'change-case';
import prompts from 'prompts';

const { first, second } = await prompts([
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

const getMixinToSingleSideOfRelation = () => `
  @OneToMany(
    () => ${firstPascal},
    (${firstCamel}) => ${firstCamel}.${secondCamel},
  )
  ${firstCamel}s!: ${firstPascal}[];
`;

console.log(`\n------ Mixin for ${firstPascal} model:\n`);
console.log(getMixinToMultipleSideOfRelation());

console.log(`\n------ Mixin for ${secondPascal} model:\n`);
console.log(getMixinToSingleSideOfRelation());
