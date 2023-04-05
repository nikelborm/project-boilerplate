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
import { camelCase, pascalCase } from 'change-case';
import prompts from 'prompts';
import { appendFile, writeFile, mkdir, readFile } from 'fs/promises';
import chalk from 'chalk';
import {
  lintBackend,
  writeNewDI_UseCaseFileAndExtendDirReexportsAndLog,
  writeNewFileAndAndLog,
  writeNewFileAndExtendDirReexportsAndLog,
} from '../common/index.js';
import { closeSync, openSync } from 'fs';

const {
  entityName,
  camelMultiple,
  pascalMultiple,
  dryRun,
  selectedFilesToGenerate /* , entityNameMultiples */,
} = await prompts([
  {
    type: 'text',
    name: 'entityName',
    message: `${chalk.yellow(`Module generation does not support generation for intermediate relation entities
Currently supported generation only for entities with single id column`)}

Entity name (fully lower case) with space delimiter`,
  },
  {
    type: 'text',
    name: 'camelMultiple',
    message: 'Camel multiple form:',
    initial: (prev) => `${camelCase(prev)}s`,
  },
  {
    type: 'text',
    name: 'pascalMultiple',
    message: 'Pascal multiple form:',
    initial: (prev) => pascalCase(prev),
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
        title: 'Module + UseCase + folder + index.ts (required)',
        value: 'moduleAndUseCase',
        selected: true,
      },
      {
        title: 'Controller',
        value: 'controller',
        selected: true,
      },
    ],
    hint: '- Space to select. Enter to submit',
  },
  // {
  //   type: 'multiselect',
  //   name: 'selectedFunctionsToGenerate',
  //   message: 'Pick functions to generate',
  //   choices: [
  //     {
  //       title: 'Create Many', // POST in /batch
  //       value: 'createMany',
  //       selected: true,
  //     },
  //     {
  //       title: 'Create 1', // POST in /
  //       value: 'createOne',
  //       selected: true,
  //     },
  //     {
  //       title: 'Get 1 by id', // GET in /:id
  //       value: 'getOneById',
  //       selected: true,
  //     },
  //     {
  //       title: 'Get all', // GET in /batch
  //       value: 'getAll',
  //       selected: true,
  //     },
  //     {
  //       title: 'Update 1 by id', // PUT in /:id
  //       value: 'updateOneById',
  //       selected: true,
  //     },
  //     {
  //       title: 'Delete 1 by id', // Delete in /:id
  //       value: 'deleteOneById',
  //       selected: true,
  //     },
  //     {
  //       title: 'Delete Many by ids', // Delete in /batch/?ids=1,2,4
  //       value: 'deleteManyByIds',
  //       selected: true,
  //     },
  //   ],
  //   hint: '- Space to select. Enter to submit',
  // },
]);

const pascal = pascalCase(entityName);
const camel = camelCase(entityName);

// console.log('entityNameMultiples: ', entityNameMultiples);

const getModule = () => `import { Module } from '@nestjs/common';${
  selectedFilesToGenerate.includes('controller')
    ? `\nimport { ${pascal}Controller } from './${camel}.controller';`
    : ''
}
import { ${pascal}UseCaseProvider } from './${camel}.useCase';
import { DI_${pascal}UseCase } from './di';

@Module({
  providers: [${pascal}UseCaseProvider],
  controllers: [${
    selectedFilesToGenerate.includes('controller') ? `${pascal}Controller` : ''
  }],
  exports: [DI_${pascal}UseCase],
})
export class ${pascal}Module {}
`;

const getIndex = () => `export * from './${camel}.module';
export * from './di';
`;

const getUseCase =
  () => `import { BadRequestException, Injectable, type Provider } from '@nestjs/common';
import { messages } from 'src/config';
import { getRedundantAndMissingValues } from 'src/tools';
import { DI_${pascal}Repo, type ${pascal}RepoTypes } from 'src/infrastructure';
import { DI_${pascal}UseCase } from './di';

@Injectable()
class ${pascal}UseCase implements DI_${pascal}UseCase {
  constructor(private readonly ${camel}Repo: DI_${pascal}Repo) {}

  async getAll(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    search?: string,
  ): Promise<${pascal}RepoTypes['Public']['SelectedOnePlainEntity'][]> {
    return await this.${camel}Repo.getAll();
  }

  async getOneById(
    ${camel}Id: number,
  ): Promise<${pascal}RepoTypes['Public']['SelectedOnePlainEntity']> {
    const ${camel} = await this.${camel}Repo.findOneById(${camel}Id);
    if (!${camel})
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundById(${camel}Id, '${camel}'),
      );
    return ${camel};
  }

  async getManyByIds(
    ${camel}Ids: number[],
  ): Promise<${pascal}RepoTypes['Public']['SelectedOnePlainEntity'][]> {
    const ${camelMultiple} = await this.${camel}Repo.findManyByIds(${camel}Ids);
    const foundIds = ${camelMultiple}.map(({ id }) => id);
    const { missingValues: missingIds } = getRedundantAndMissingValues(
      ${camel}Ids,
      foundIds,
    );
    if (missingIds.length)
      throw new BadRequestException(
        messages.repo.common.cantGetSomeIdsWereNotFound(
          ${camel}Ids,
          missingIds,
          '${camel}',
        ),
      );
    return ${camelMultiple};
  }

  createOne${pascal}: ${pascal}RepoTypes['Public']['CreateOnePlainEntityFunctionType'] =
    async (${camel}) => await this.${camel}Repo.createOnePlain(${camel});

  createMany${pascalMultiple}: ${pascal}RepoTypes['Public']['CreateManyPlainEntitiesFunctionType'] =
    async (${camelMultiple}) => await this.${camel}Repo.createManyPlain(${camelMultiple});

  async updateOne${pascal}<
    ${pascal}ToUpdate extends ${pascal}RepoTypes['Public']['OnePlainEntityToBeUpdated'],
  >({ id, ...updatedPart }: ${pascal}ToUpdate): Promise<void> {
    await this.${camel}Repo.updateOnePlain(
      { id },
      updatedPart as ${pascal}RepoTypes['Parts']['UpdatablePlainPart'],
    );
  }

  async updateMany${pascalMultiple}<
    ${pascal}ToUpdate extends ${pascal}RepoTypes['Public']['OnePlainEntityToBeUpdated'],
  >(${camelMultiple}: ${pascal}ToUpdate[]): Promise<void> {
    await this.${camel}Repo.updateManyPlain(${camelMultiple});
  }

  async deleteOne${pascal}ById(${camel}Id: number): Promise<void> {
    await this.${camel}Repo.deleteOneById(${camel}Id);
  }

  async deleteMany${pascalMultiple}ByIds(${camel}Ids: number[]): Promise<void> {
    await this.${camel}Repo.deleteManyByIds(${camel}Ids);
  }
}

export const ${pascal}UseCaseProvider: Provider = {
  provide: DI_${pascal}UseCase,
  useClass: ${pascal}UseCase,
};
`;

const getDI_UseCase =
  () => `import type { ${pascal}RepoTypes } from 'src/infrastructure';

export abstract class DI_${pascal}UseCase {
  abstract getAll(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    search?: string,
  ): Promise<${pascal}RepoTypes['Public']['SelectedOnePlainEntity'][]>;

  abstract getOneById(
    ${camel}Id: number,
  ): Promise<${pascal}RepoTypes['Public']['SelectedOnePlainEntity']>;

  abstract getManyByIds(
    ${camel}Ids: number[],
  ): Promise<${pascal}RepoTypes['Public']['SelectedOnePlainEntity'][]>;

  abstract createOne${pascal}: ${pascal}RepoTypes['Public']['CreateOnePlainEntityFunctionType'];

  abstract createMany${pascalMultiple}: ${pascal}RepoTypes['Public']['CreateManyPlainEntitiesFunctionType'];

  abstract updateOne${pascal}<
    ${pascal}ToUpdate extends ${pascal}RepoTypes['Public']['OnePlainEntityToBeUpdated'],
  >({ id, ...updatedPart }: ${pascal}ToUpdate): Promise<void>;

  abstract updateMany${pascalMultiple}<
    ${pascal}ToUpdate extends ${pascal}RepoTypes['Public']['OnePlainEntityToBeUpdated'],
  >(${camelMultiple}: ${pascal}ToUpdate[]): Promise<void>;

  abstract deleteOne${pascal}ById(${camel}Id: number): Promise<void>;

  abstract deleteMany${pascalMultiple}ByIds(${camel}Ids: number[]): Promise<void>;
}
`;

const getController = () => `import {
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import {
  AccessEnum,
  AllowedFor,
  ApiController,
  ActiveSessionOnly,
  ValidatedBody,
} from 'src/tools';
import {
  CreateMany${pascalMultiple}RequestDTO,
  CreateMany${pascalMultiple}ResponseDTO,
  CreateOne${pascal}RequestDTO,
  CreateOne${pascal}ResponseDTO,
  EmptyResponseDTO,
  FindMany${pascalMultiple}ResponseDTO,
  GetOne${pascal}ByIdResponseDTO,
  UpdatedPartOfOne${pascal}DTO,
  UpdateMany${pascalMultiple}RequestDTO,
} from 'src/types';
import { DI_${pascal}UseCase } from './di';

@ApiController('${camel}')
export class ${pascal}Controller {
  constructor(private readonly ${camel}UseCase: DI_${pascal}UseCase) {}

  @ApiQuery({
    name: 'search',
    description: 'Search query',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'ids',
    description: 'Get only ${camelMultiple} with these ids',
    required: false,
    isArray: true,
    type: Number,
  })
  @Get('/batch')
  @ActiveSessionOnly()
  async getAll${pascalMultiple}OrFindByIds(
    @Query('search') search?: string | undefined,
    @Query(
      'ids',
      new ParseArrayPipe({ items: Number, optional: true, separator: ',' }),
    )
    ids?: number[] | undefined,
  ): Promise<FindMany${pascalMultiple}ResponseDTO> {
    if (ids)
      return {
        ${camelMultiple}: await this.${camel}UseCase.getManyByIds(ids),
      };
    return {
      ${camelMultiple}: await this.${camel}UseCase.getAll(search),
    };
  }

  @Get('/:${camel}Id')
  @ActiveSessionOnly()
  async getOne${pascal}ById(
    @Param('${camel}Id', ParseIntPipe) ${camel}Id: number,
  ): Promise<GetOne${pascal}ByIdResponseDTO> {
    return await this.${camel}UseCase.getOneById(${camel}Id);
  }

  @Post('/batch')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async createMany${pascalMultiple}(
    @ValidatedBody()
    { ${camelMultiple} }: CreateMany${pascalMultiple}RequestDTO,
  ): Promise<CreateMany${pascalMultiple}ResponseDTO> {
    return {
      created${pascalMultiple}: await this.${camel}UseCase.createMany${pascalMultiple}(${camelMultiple}),
    };
  }

  @Post('/')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async createOne${pascal}(
    @ValidatedBody()
    create${pascal}DTO: CreateOne${pascal}RequestDTO,
  ): Promise<CreateOne${pascal}ResponseDTO> {
    return await this.${camel}UseCase.createOne${pascal}(create${pascal}DTO);
  }

  @Put('/batch')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async updateMany${pascalMultiple}(
    @ValidatedBody()
    { ${camelMultiple} }: UpdateMany${pascalMultiple}RequestDTO,
  ): Promise<EmptyResponseDTO> {
    await this.${camel}UseCase.updateMany${pascalMultiple}(${camelMultiple});
    return {};
  }

  @Put('/:${camel}Id')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async updateOne${pascal}(
    @Param('${camel}Id', ParseIntPipe) ${camel}Id: number,
    @ValidatedBody()
    updated${pascal}: UpdatedPartOfOne${pascal}DTO,
  ): Promise<EmptyResponseDTO> {
    await this.${camel}UseCase.updateOne${pascal}({ id: ${camel}Id, ...updated${pascal} });
    return {};
  }

  @Delete('/batch')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async deleteMany${pascalMultiple}(
    @Query(
      'ids',
      new ParseArrayPipe({ items: Number, optional: false, separator: ',' }),
    )
    ${camel}Ids: number[],
  ): Promise<EmptyResponseDTO> {
    await this.${camel}UseCase.deleteMany${pascalMultiple}ByIds(${camel}Ids);
    return {};
  }

  @Delete('/:${camel}Id')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async deleteOne${pascal}(
    @Param('${camel}Id', ParseIntPipe) ${camel}Id: number,
  ): Promise<EmptyResponseDTO> {
    await this.${camel}UseCase.deleteOne${pascal}ById(${camel}Id);
    return {};
  }
}
`;

const getCreateOneOrManyRequestDTO =
  () => `// here AllowToBeNotDefinedOrDefinedAsNullButFailIfEqualsUndefined is recommended
import { NestedArrayDTO } from '../../../../../tools/shared';

export class CreateOne${pascal}RequestDTO {
}

export class CreateMany${pascalMultiple}RequestDTO {
  @NestedArrayDTO(() => CreateOne${pascal}RequestDTO)
  ${camelMultiple}!: CreateOne${pascal}RequestDTO[];
}
`;

const getUpdateOneOrManyRequestDTO =
  () => `import { IsPositive, IsString, IsOptional } from 'class-validator';
// here AllowToBeNotDefinedOrDefinedAsNullButFailIfEqualsUndefined is recommended
import { NestedArrayDTO } from '../../../../../tools/shared';

export class UpdatedPartOfOne${pascal}DTO {
}

export class UpdateOne${pascal}RequestDTO extends UpdatedPartOfOne${pascal}DTO {
  @IsPositive()
  id!: number;
}

export class UpdateMany${pascalMultiple}RequestDTO {
  @NestedArrayDTO(() => UpdateOne${pascal}RequestDTO)
  ${camelMultiple}!: UpdateOne${pascal}RequestDTO[];
}
`;

const getCreateOneOrManyResponseDTO =
  () => `import { IsPositive } from 'class-validator';
// here AllowToBeNullButFailIfNotDefinedOrEqualsUndefined is recommended
import { IsDateConverted, NestedArrayDTO } from '../../../../../tools/shared';

export class CreateOne${pascal}ResponseDTO {
  @IsPositive()
  id!: number;

  @IsDateConverted()
  createdAt!: Date;

  @IsDateConverted()
  updatedAt!: Date;
}

export class CreateMany${pascalMultiple}ResponseDTO {
  @NestedArrayDTO(() => CreateOne${pascal}ResponseDTO)
  created${pascalMultiple}!: CreateOne${pascal}ResponseDTO[];
}
`;

const getFindOneOrManyResponseDTO =
  () => `import { IsPositive } from 'class-validator';
// here AllowToBeNullButFailIfNotDefinedOrEqualsUndefined is recommended
import { IsDateConverted, NestedArrayDTO } from '../../../../../tools/shared';

export class GetOne${pascal}ByIdResponseDTO {
  @IsPositive()
  id!: number;

  @IsDateConverted()
  createdAt!: Date;

  @IsDateConverted()
  updatedAt!: Date;
}

export class FindMany${pascalMultiple}ResponseDTO {
  @NestedArrayDTO(() => GetOne${pascal}ByIdResponseDTO)
  ${camelMultiple}!: GetOne${pascal}ByIdResponseDTO[];
}
`;

const getUpdatedAppModule = async () => {
  const appModuleImportsRegexp = /(imports:[ [\nA-Za-z,]*,)[ \n]*]/g;

  const appModuleEcmascriptImportsRegexp =
    /(import [ {\nA-Za-z,]*,)[ \n]*} *from *'.';/g;

  let appModuleTsFileContent = (
    await readFile('./backend/src/app.module.ts')
  ).toString();

  let { ['1']: group, index } = [
    ...appModuleTsFileContent.matchAll(appModuleImportsRegexp),
  ][0];
  if (!index) throw new Error('appModuleImportsRegexp was not found');

  appModuleTsFileContent = `${appModuleTsFileContent.slice(
    0,
    index + group.length,
  )}
    ${pascal}Module,${appModuleTsFileContent.slice(index + group.length)}`;

  ({ ['1']: group, index } = [
    ...appModuleTsFileContent.matchAll(appModuleEcmascriptImportsRegexp),
  ][0]);

  if (!index) throw new Error('appModuleEcmascriptImportsRegexp was not found');

  return `${appModuleTsFileContent.slice(0, index + group.length)}
  ${pascal}Module,${appModuleTsFileContent.slice(index + group.length)}`;
};

async function createModuleDirectory() {
  if (!dryRun) {
    try {
      await mkdir(`./backend/src/${camel}`);
      console.log(chalk.gray(`\n------ new ${camel} folder was generated\n`));
    } catch (error) {
      console.log('error: ', error);
    }
  }
}

async function createDI_Directory() {
  if (!dryRun) {
    try {
      await mkdir(`./backend/src/${camel}/di`);
      closeSync(openSync(`./backend/src/${camel}/di/index.ts`, 'w'));
      console.log(
        chalk.gray(`\n------ new ${camel} di folder was generated\n`),
      );
    } catch (error) {
      console.log('error: ', error);
    }
  }
}

async function appendModuleReexportToIndexFileInModulesDir() {
  if (!dryRun) {
    await appendFile(`./backend/src/index.ts`, `export * from './${camel}';\n`);
    console.log(
      chalk.gray(`\n------ index.ts reexport of src was written to disk:\n`),
    );
  }
}

async function createLocalModuleReexportIndexFile() {
  console.log(chalk.cyan(`\n------ new index.ts was generated\n`));
  console.log(getIndex());

  if (!dryRun) {
    await writeFile(`./backend/src/${camel}/index.ts`, getIndex());
    console.log(chalk.gray(`\n------ new index.ts was written to disk:\n`));
  }
}

if (selectedFilesToGenerate.includes('moduleAndUseCase')) {
  await createModuleDirectory();

  await appendModuleReexportToIndexFileInModulesDir();

  await writeNewFileAndAndLog(
    'module',
    `${pascal}Module`,
    getModule(),
    `./backend/src/${camel}/${camel}.module.ts`,
    dryRun,
  );

  await createLocalModuleReexportIndexFile();

  await writeNewFileAndAndLog(
    'Use case',
    `${pascal}UseCase`,
    getUseCase(),
    `./backend/src/${camel}/${camel}.useCase.ts`,
    dryRun,
  );

  await createDI_Directory();
  await writeNewDI_UseCaseFileAndExtendDirReexportsAndLog(
    entityName,
    getDI_UseCase(),
    dryRun,
  );

  await writeNewFileAndExtendDirReexportsAndLog(
    'DTO',
    `CreateOneOrMany${pascal}RequestDTO`,
    getCreateOneOrManyRequestDTO(),
    `./shared/src/types/shared/dto/request_body/mutation/createOneOrMany${pascalMultiple}.dto.ts`,
    dryRun,
    `./shared/src/types/shared/dto/request_body/mutation/index.ts`,
    `export * from './createOneOrMany${pascalMultiple}.dto';\n`,
  );

  await writeNewFileAndExtendDirReexportsAndLog(
    'DTO',
    `UpdateOneOrMany${pascal}RequestDTO`,
    getUpdateOneOrManyRequestDTO(),
    `./shared/src/types/shared/dto/request_body/mutation/updateOneOrMany${pascalMultiple}.dto.ts`,
    dryRun,
    `./shared/src/types/shared/dto/request_body/mutation/index.ts`,
    `export * from './updateOneOrMany${pascalMultiple}.dto';\n`,
  );

  await writeNewFileAndExtendDirReexportsAndLog(
    'DTO',
    `CreateOneOrMany${pascal}ResponseDTO`,
    getCreateOneOrManyResponseDTO(),
    `./shared/src/types/shared/dto/response_body/mutation/createOneOrMany${pascalMultiple}.dto.ts`,
    dryRun,
    `./shared/src/types/shared/dto/response_body/mutation/index.ts`,
    `export * from './createOneOrMany${pascalMultiple}.dto';\n`,
  );

  await writeNewFileAndExtendDirReexportsAndLog(
    'DTO',
    `GetOneOrFindMany${pascal}ResponseDTO`,
    getFindOneOrManyResponseDTO(),
    `./shared/src/types/shared/dto/response_body/query/getOneOrMany${pascalMultiple}.dto.ts`,
    dryRun,
    `./shared/src/types/shared/dto/response_body/query/index.ts`,
    `export * from './getOneOrMany${pascalMultiple}.dto';\n`,
  );

  console.log(chalk.cyan(`\n------ new AppModule.ts were generated\n`));
  const newAppModule = await getUpdatedAppModule();
  console.log(newAppModule);

  if (!dryRun) {
    await writeFile(`./backend/src/app.module.ts`, newAppModule);
    console.log(chalk.gray(`\n------ new AppModule.ts was written to disk:\n`));
  }
}

if (selectedFilesToGenerate.includes('controller')) {
  await writeNewFileAndAndLog(
    'Controller',
    `${pascal}Controller`,
    getController(),
    `./backend/src/${camel}/${camel}.controller.ts`,
    dryRun,
  );
}

await lintBackend(dryRun);

console.log(chalk.cyan(`\n------ executed successfully\n`));
