/* eslint-disable @typescript-eslint/explicit-function-return-type */
// @ts-check
import { camelCase, pascalCase, snakeCase } from 'change-case';
import prompts from 'prompts';
import { appendFile, writeFile } from 'fs/promises';
import chalk from 'chalk';

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
    ],
    max: 3,
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
import { Repository } from 'typeorm';
import { ${firstPascal}To${secondPascal} } from '../model';

@Injectable()
export class ${firstPascal}To${secondPascal}Repo {
  constructor(
    @InjectRepository(${firstPascal}To${secondPascal})
    private readonly repo: Repository<${firstPascal}To${secondPascal}>,
  ) {}

  async getAll(): Promise<${firstPascal}To${secondPascal}[]> {
    return await this.repo.find();
  }

  async createOne(
    new${firstPascal}To${secondPascal}: CreatedOnePlain${firstPascal}To${secondPascal},
  ): Promise<CreatedOnePlain${firstPascal}To${secondPascal}> {
    await this.repo.insert(new${firstPascal}To${secondPascal});
    return new${firstPascal}To${secondPascal};
  }

  async createMany(
    new${firstPascal}To${secondPascal}s: CreatedOnePlain${firstPascal}To${secondPascal}[],
  ): Promise<CreatedOnePlain${firstPascal}To${secondPascal}[]> {
    await this.repo.insert(new${firstPascal}To${secondPascal}s);
    return new${firstPascal}To${secondPascal}s;
  }
}

type PlainKeysAllowedToModify = '${firstCamel}Id' | '${secondCamel}Id';

type CreatedOnePlain${firstPascal}To${secondPascal} = Pick<
  ${firstPascal}To${secondPascal},
  PlainKeysAllowedToModify
>;
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

const getFirstModelInterfaceMixin = () => `
  ${secondCamel}s!: I${secondPascal}[];

  ${firstCamel}To${secondPascal}Relations!: I${firstPascal}To${secondPascal}[];
`;

const getSecondModelInterfaceMixin = () => `
  ${firstCamel}sWithThat${secondPascal}!: I${firstPascal}[];

  ${firstCamel}To${secondPascal}Relations!: I${firstPascal}To${secondPascal}[];
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

  console.log(
    chalk.cyan(
      `\n------ Mixin for ${firstPascal} model (needs to be added manually):\n`,
    ),
  );
  console.log(chalk.green(getFirstModelMixin()));
  console.log(
    chalk.cyan(
      `\n------ Mixin for ${secondPascal} model (needs to be added manually):\n`,
    ),
  );
  console.log(chalk.green(getSecondModelMixin()));

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
    chalk.cyan(
      `\n------ Mixin for I${firstPascal} model interface (needs to be added manually):\n`,
    ),
  );
  console.log(chalk.green(getFirstModelInterfaceMixin()));
  console.log(
    chalk.cyan(
      `\n------ Mixin for I${secondPascal} model interface (needs to be added manually):\n`,
    ),
  );
  console.log(chalk.green(getSecondModelInterfaceMixin()));
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

console.log(chalk.cyan(`\n------ executed successfully\n`));
