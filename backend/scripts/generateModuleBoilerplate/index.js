/* eslint-disable @typescript-eslint/explicit-function-return-type */
// @ts-check
import { camelCase, pascalCase } from 'change-case';
import prompts from 'prompts';
import { appendFile, writeFile, mkdir, readFile } from 'fs/promises';
import chalk from 'chalk';
import {
  writeNewFileAndAndLog,
  writeNewFileAndExtendDirReexportsAndLog,
} from '../common/index.js';

const { entityName, dryRun, selectedFilesToGenerate } = await prompts([
  {
    type: 'text',
    name: 'entityName',
    message: `${chalk.yellow(`Module generation does not support generation for intermediate relation entities
Currently supported generation only for entities with single id column`)}

Entity name (fully lower case) with space delimiter`,
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

const getModule = () => `import { Module } from '@nestjs/common';${
  selectedFilesToGenerate.includes('controller')
    ? `\nimport { ${pascal}Controller } from './${camel}.controller';`
    : ''
}
import { ${pascal}UseCase } from './${camel}.useCase';

@Module({
  providers: [${pascal}UseCase],
  controllers: [${
    selectedFilesToGenerate.includes('controller') ? `${pascal}Controller` : ''
  }],
  exports: [${pascal}UseCase],
})
export class ${pascal}Module {}
`;

const getIndex = () => `export * from './${camel}.module';
export * from './${camel}.useCase';
`;

const getUseCase =
  () => `import { BadRequestException, Injectable } from '@nestjs/common';
import { messages } from 'src/config';
import { getRedundantAndMissingValues } from 'src/tools';
import { repo } from '../infrastructure';

@Injectable()
export class ${pascal}UseCase {
  constructor(private readonly ${camel}Repo: repo.${pascal}Repo) {}

  async getAll(
    search?: string,
  ): Promise<repo.${pascal}PublicRepoTypes['SelectedOnePlainEntity'][]> {
    return await this.${camel}Repo.getAll();
  }

  async getOneById(
    ${camel}Id: number,
  ): Promise<repo.${pascal}PublicRepoTypes['SelectedOnePlainEntity']> {
    const ${camel} = await this.${camel}Repo.findOneById(${camel}Id);
    if (!${camel})
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundById(${camel}Id, '${camel}'),
      );
    return ${camel};
  }

  async getManyByIds(
    ${camel}Ids: number[],
  ): Promise<repo.${pascal}PublicRepoTypes['SelectedOnePlainEntity'][]> {
    const ${camel}s = await this.${camel}Repo.findManyByIds(${camel}Ids);
    const foundIds = ${camel}s.map(({ id }) => id);
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
    return ${camel}s;
  }

  createOne${pascal}: repo.${pascal}PublicRepoTypes['CreateOnePlainEntityFunctionType'] =
    async (${camel}) => await this.${camel}Repo.createOnePlain(${camel});

  createMany${pascal}s: repo.${pascal}PublicRepoTypes['CreateManyPlainEntitiesFunctionType'] =
    async (${camel}s) => await this.${camel}Repo.createManyPlain(${camel}s);

  async updateOne${pascal}<
    Provided${pascal}ToUpdate extends repo.${pascal}PublicRepoTypes['OnePlainEntityToBeUpdated'],
  >({ id, ...updatedPart }: Provided${pascal}ToUpdate): Promise<void> {
    await this.${camel}Repo.updateOnePlain(
      { id },
      updatedPart as repo.${pascal}PublicRepoTypes['Parts']['UpdatablePlainPart'],
    );
  }

  async updateMany${pascal}s<
    Provided${pascal}ToUpdate extends repo.${pascal}PublicRepoTypes['OnePlainEntityToBeUpdated'],
  >(${camel}s: Provided${pascal}ToUpdate[]): Promise<void> {
    await this.${camel}Repo.updateManyPlain(${camel}s);
  }

  async deleteOne${pascal}ById(${camel}Id: number): Promise<void> {
    await this.${camel}Repo.deleteOneById(${camel}Id);
  }

  async deleteMany${pascal}sByIds(${camel}Ids: number[]): Promise<void> {
    await this.${camel}Repo.deleteManyByIds(${camel}Ids);
  }
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
  AuthorizedOnly,
  ValidatedBody,
} from 'src/tools';
import {
  CreateMany${pascal}sRequestDTO,
  CreateMany${pascal}sResponseDTO,
  CreateOne${pascal}RequestDTO,
  CreateOne${pascal}ResponseDTO,
  EmptyResponseDTO,
  FindMany${pascal}sResponseDTO,
  GetOne${pascal}ByIdResponseDTO,
  UpdatedPartOfOne${pascal}RequestDTO,
  UpdateMany${pascal}sRequestDTO,
} from 'src/types';
import { ${pascal}UseCase } from './${camel}.useCase';

@ApiController('${camel}')
export class ${pascal}Controller {
  constructor(private readonly ${camel}UseCase: ${pascal}UseCase) {}

  @ApiQuery({
    name: 'search',
    description: 'Search query',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'ids',
    description: 'Get only ${camel}s with these ids',
    required: false,
    isArray: true,
    type: Number,
  })
  @Get('/batch')
  @AuthorizedOnly()
  async getAll${pascal}sOrFindByIds(
    @Query('search') search?: string | undefined,
    @Query(
      'ids',
      new ParseArrayPipe({ items: Number, optional: true, separator: ',' }),
    )
    ids?: number[] | undefined,
  ): Promise<FindMany${pascal}sResponseDTO> {
    if (ids)
      return {
        ${camel}s: await this.${camel}UseCase.getManyByIds(ids),
      };
    return {
      ${camel}s: await this.${camel}UseCase.getAll(search),
    };
  }

  @Get('/:${camel}Id')
  @AuthorizedOnly()
  async getOne${pascal}ById(
    @Param('${camel}Id', ParseIntPipe) ${camel}Id: number,
  ): Promise<GetOne${pascal}ByIdResponseDTO> {
    return await this.${camel}UseCase.getOneById(${camel}Id);
  }

  @Post('/batch')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async createMany${pascal}s(
    @ValidatedBody()
    { ${camel}s }: CreateMany${pascal}sRequestDTO,
  ): Promise<CreateMany${pascal}sResponseDTO> {
    return {
      created${pascal}s: await this.${camel}UseCase.createMany${pascal}s(${camel}s),
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
  async updateMany${pascal}s(
    @ValidatedBody()
    { ${camel}s }: UpdateMany${pascal}sRequestDTO,
  ): Promise<EmptyResponseDTO> {
    await this.${camel}UseCase.updateMany${pascal}s(${camel}s);
    return {};
  }

  @Put('/:${camel}Id')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async updateOne${pascal}(
    @Param('${camel}Id', ParseIntPipe) ${camel}Id: number,
    @ValidatedBody()
    updated${pascal}: UpdatedPartOfOne${pascal}RequestDTO,
  ): Promise<EmptyResponseDTO> {
    await this.${camel}UseCase.updateOne${pascal}({ id: ${camel}Id, ...updated${pascal} });
    return {};
  }

  @Delete('/batch')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async deleteMany${pascal}s(
    @Query(
      'ids',
      new ParseArrayPipe({ items: Number, optional: false, separator: ',' }),
    )
    ${camel}Ids: number[],
  ): Promise<EmptyResponseDTO> {
    await this.${camel}UseCase.deleteMany${pascal}sByIds(${camel}Ids);
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

const getCreateOneOrManyRequestDTO = () => `import {
  AllowToBeNotDefinedOrDefinedAsNullButFailIfEqualsUndefined,
  NestedArrayDTO,
} from '../../../../../tools/shared';

export class CreateOne${pascal}RequestDTO {
}

export class CreateMany${pascal}sRequestDTO {
  @NestedArrayDTO(() => CreateOne${pascal}RequestDTO)
  ${camel}s!: CreateOne${pascal}RequestDTO[];
}
`;

const getUpdateOneOrManyRequestDTO =
  () => `import { IsPositive, IsString } from 'class-validator';
import {
  AllowToBeNotDefinedOrDefinedAsNullButFailIfEqualsUndefined,
  NestedArrayDTO,
} from '../../../../../tools/shared';

export class UpdatedPartOfOne${pascal}DTO {
}

export class UpdateOne${pascal}RequestDTO extends UpdatedPartOfOne${pascal}RequestDTO {
  @IsPositive()
  id!: number;
}

export class UpdateMany${pascal}sRequestDTO {
  @NestedArrayDTO(() => UpdateOne${pascal}RequestDTO)
  ${camel}s!: UpdateOne${pascal}RequestDTO[];
}
`;

const getCreateOneOrManyResponseDTO =
  () => `import { IsPositive } from 'class-validator';
import {
  AllowToBeNullButFailIfNotDefinedOrEqualsUndefined,
  IsDateConverted,
  NestedArrayDTO,
} from '../../../../../tools/shared';

export class CreateOne${pascal}ResponseDTO {
  @IsPositive()
  id!: number;

  @IsDateConverted()
  createdAt!: Date;

  @IsDateConverted()
  updatedAt!: Date;
}

export class CreateMany${pascal}sResponseDTO {
  @NestedArrayDTO(() => CreateOne${pascal}ResponseDTO)
  created${pascal}s!: CreateOne${pascal}ResponseDTO[];
}
`;

const getFindOneOrManyResponseDTO =
  () => `import { IsPositive } from 'class-validator';
import {
  AllowToBeNullButFailIfNotDefinedOrEqualsUndefined,
  IsDateConverted,
  NestedArrayDTO,
} from '../../../../../tools/shared';

export class GetOne${pascal}ByIdResponseDTO {
  @IsPositive()
  id!: number;

  @IsDateConverted()
  createdAt!: Date;

  @IsDateConverted()
  updatedAt!: Date;
}

export class FindMany${pascal}sResponseDTO {
  @NestedArrayDTO(() => GetOne${pascal}ByIdResponseDTO)
  ${camel}s!: GetOne${pascal}ByIdResponseDTO[];
}
`;

const getUpdatedAppModule = async () => {
  const appModuleImportsRegexp = /(imports:[ \[\n\A-Za-z,]*,)[ \n]*]/g;

  const appModuleEcmascriptImportsRegexp =
    /(import [ \{\n\A-Za-z,]*,)[ \n]*} *from *'.';/g;

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
    await mkdir(`./backend/src/${camel}`);
    console.log(chalk.gray(`\n------ new ${camel} folder was generated\n`));
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

  await writeNewFileAndExtendDirReexportsAndLog(
    'DTO',
    `CreateOneOrMany${pascal}RequestDTO`,
    getCreateOneOrManyRequestDTO(),
    `./shared/src/types/shared/dto/request_body/mutation/createOneOrMany${pascal}s.dto.ts`,
    dryRun,
    `./shared/src/types/shared/dto/request_body/mutation/index.ts`,
    `export * from './createOneOrMany${pascal}s.dto';\n`,
  );

  await writeNewFileAndExtendDirReexportsAndLog(
    'DTO',
    `UpdateOneOrMany${pascal}RequestDTO`,
    getUpdateOneOrManyRequestDTO(),
    `./shared/src/types/shared/dto/request_body/mutation/updateOneOrMany${pascal}s.dto.ts`,
    dryRun,
    `./shared/src/types/shared/dto/request_body/mutation/index.ts`,
    `export * from './updateOneOrMany${pascal}s.dto';\n`,
  );

  await writeNewFileAndExtendDirReexportsAndLog(
    'DTO',
    `CreateOneOrMany${pascal}ResponseDTO`,
    getCreateOneOrManyResponseDTO(),
    `./shared/src/types/shared/dto/response_body/mutation/createOneOrMany${pascal}s.dto.ts`,
    dryRun,
    `./shared/src/types/shared/dto/response_body/mutation/index.ts`,
    `export * from './createOneOrMany${pascal}s.dto';\n`,
  );

  await writeNewFileAndExtendDirReexportsAndLog(
    'DTO',
    `GetOneOrFindMany${pascal}ResponseDTO`,
    getFindOneOrManyResponseDTO(),
    `./shared/src/types/shared/dto/response_body/query/getOneOrMany${pascal}s.dto.ts`,
    dryRun,
    `./shared/src/types/shared/dto/response_body/query/index.ts`,
    `export * from './getOneOrMany${pascal}s.dto';\n`,
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

console.log(chalk.cyan(`\n------ executed successfully\n`));
