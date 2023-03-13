/* eslint-disable @typescript-eslint/explicit-function-return-type */
// @ts-check
import { camelCase, pascalCase } from 'change-case';
import prompts from 'prompts';
import { appendFile, writeFile, mkdir, readFile } from 'fs/promises';
import chalk from 'chalk';

const { entityName, dryRun } = await prompts([
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
]);

const pascal = pascalCase(entityName);
const camel = camelCase(entityName);

const getModule = () => `import { Module } from '@nestjs/common';
import { ${pascal}Controller } from './${camel}.controller';
import { ${pascal}UseCase } from './${camel}.useCase';

@Module({
  providers: [${pascal}UseCase],
  controllers: [${pascal}Controller],
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
import type { CreateOne${pascal}RequestDTO } from 'src/types';
import { repo } from '../infrastructure';

@Injectable()
export class ${pascal}UseCase {
  constructor(private readonly ${camel}Repo: repo.${pascal}Repo) {}

  async findMany(search?: string): Promise<repo.SelectedOnePlain${pascal}[]> {
    return await this.${camel}Repo.getAll();
  }

  async getOneById(${camel}Id: number): Promise<repo.SelectedOnePlain${pascal}> {
    const ${camel} = await this.${camel}Repo.findOneById(${camel}Id);
    if (!${camel})
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundById(${camel}Id, '${camel}'),
      );
    return ${camel};
  }

  async create${pascal}(
    ${camel}: CreateOne${pascal}RequestDTO,
  ): Promise<repo.CreatedOnePlain${pascal}> {
    return await this.${camel}Repo.createOnePlain(${camel});
  }

  async createMany${pascal}s(
    ${camel}s: CreateOne${pascal}RequestDTO[],
  ): Promise<repo.CreatedOnePlain${pascal}[]> {
    return await this.${camel}Repo.createManyPlain(${camel}s);
  }

  async deleteOne(id: number): Promise<void> {
    await this.${camel}Repo.deleteOneById(id);
  }
}
`;

const getController =
  () => `import { Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import {
  AccessEnum,
  AllowedFor,
  ApiController,
  AuthorizedOnly,
  ValidatedBody,
} from 'src/tools';
import {
  CreateOne${pascal}ResponseDTO,
  CreateMany${pascal}sResponseDTO,
  CreateOne${pascal}RequestDTO,
  CreateMany${pascal}sRequestDTO,
  DeleteEntityByIdDTO,
  EmptyResponseDTO,
  FindMany${pascal}sResponseDTO,
  GetOne${pascal}ByIdResponseDTO,
} from 'src/types';
import { ${pascal}UseCase } from './${camel}.useCase';

@ApiController('${camel}')
export class ${pascal}Controller {
  constructor(private readonly ${camel}UseCase: ${pascal}UseCase) {}

  @Get('all')
  @AuthorizedOnly()
  async findMany${pascal}s(
    @Query('search') search?: string,
  ): Promise<FindMany${pascal}sResponseDTO> {
    const ${camel}s = await this.${camel}UseCase.findMany(search);
    return {
      ${camel}s,
    };
  }

  @Get('/:${camel}Id')
  @AuthorizedOnly()
  async getOne${pascal}ById(
    @Param('${camel}Id', ParseIntPipe) ${camel}Id: number,
  ): Promise<GetOne${pascal}ByIdResponseDTO> {
    return await this.${camel}UseCase.getOneById(
      ${camel}Id,
    );
  }

  @Post('create')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async create${pascal}(
    @ValidatedBody()
    create${pascal}DTO: CreateOne${pascal}RequestDTO,
  ): Promise<CreateOne${pascal}ResponseDTO> {
    return await this.${camel}UseCase.create${pascal}(create${pascal}DTO);
  }

  @Post('createMany')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async create${pascal}s(
    @ValidatedBody()
    { ${camel}s }: CreateMany${pascal}sRequestDTO,
  ): Promise<CreateMany${pascal}sResponseDTO> {
    return {
      created${pascal}s: await this.${camel}UseCase.createMany${pascal}s(${camel}s),
    };
  }

  @Post('deleteById')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async delete${pascal}(
    @ValidatedBody()
    { id }: DeleteEntityByIdDTO,
  ): Promise<EmptyResponseDTO> {
    await this.${camel}UseCase.deleteOne(id);
    return {};
  }
}
`;

const getCreateOneAndManyRequestDTO =
  () => `import { NestedArrayDTO } from '../../../../../tools/shared';

export class CreateOne${pascal}RequestDTO {
}

export class CreateMany${pascal}sRequestDTO {
  @NestedArrayDTO(() => CreateOne${pascal}RequestDTO)
  ${camel}s!: CreateOne${pascal}RequestDTO[];
}
`;

const getCreateOneAndManyResponseDTO =
  () => `import { IsDateConverted, NestedArrayDTO } from '../../../../../tools/shared';
import { IsPositive } from 'class-validator';

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
import { IsDateConverted, NestedArrayDTO } from '../../../../../tools/shared';

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

const getNewAppModule = async () => {
  const appModuleImportsRegexp = /(imports:[ \[\n\A-Za-z,]*,)[ \n]*]/g;

  const appModuleEcmascriptImportsRegexp =
    /(import [ \{\n\A-Za-z,]*,)[ \n]*} *from *'.\/modules';/g;

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

if (!dryRun) {
  await mkdir(`./backend/src/modules/${camel}`);
  console.log(chalk.gray(`\n------ new ${camel} folder was generated\n`));
  await appendFile(
    `./backend/src/modules/index.ts`,
    `export * from './${camel}';\n`,
  );
  console.log(
    chalk.gray(`\n------ index.ts reexport of modules was written to disk:\n`),
  );
}

console.log(chalk.cyan(`\n------ new ${pascal}Module was generated\n`));
console.log(getModule());

if (!dryRun) {
  await writeFile(
    `./backend/src/modules/${camel}/${camel}.module.ts`,
    getModule(),
  );
  console.log(
    chalk.gray(`\n------ new ${pascal}Module was written to disk:\n`),
  );
}

console.log(chalk.cyan(`\n------ new index.ts was generated\n`));
console.log(getIndex());

if (!dryRun) {
  await writeFile(`./backend/src/modules/${camel}/index.ts`, getIndex());
  console.log(chalk.gray(`\n------ new index.ts was written to disk:\n`));
}

console.log(chalk.cyan(`\n------ new ${pascal}UseCase was generated\n`));
console.log(getUseCase());

if (!dryRun) {
  await writeFile(
    `./backend/src/modules/${camel}/${camel}.useCase.ts`,
    getUseCase(),
  );
  console.log(
    chalk.gray(`\n------ new ${pascal}UseCase was written to disk:\n`),
  );
}

console.log(chalk.cyan(`\n------ new ${pascal}Controller was generated\n`));
console.log(getController());

if (!dryRun) {
  await writeFile(
    `./backend/src/modules/${camel}/${camel}.controller.ts`,
    getController(),
  );
  console.log(
    chalk.gray(`\n------ new ${pascal}Controller was written to disk:\n`),
  );
}

console.log(
  chalk.cyan(
    `\n------ new CreateOne${pascal}RequestDTO, CreateMany${pascal}sRequestDTO were generated\n`,
  ),
);
console.log(getCreateOneAndManyRequestDTO());

if (!dryRun) {
  await writeFile(
    `./shared/src/types/shared/dto/request_body/mutation/createOneOrMany${pascal}s.dto.ts`,
    getCreateOneAndManyRequestDTO(),
  );
  console.log(
    chalk.gray(
      `\n------ new createOneOrMany${pascal}s.dto was written to disk:\n`,
    ),
  );
  await appendFile(
    `./shared/src/types/shared/dto/request_body/mutation/index.ts`,
    `export * from './createOneOrMany${pascal}s.dto';\n`,
  );
  console.log(
    chalk.gray(
      `\n------ index.ts reexport of createOneOrMany${pascal}s.dto was written to disk:\n`,
    ),
  );
}

console.log(
  chalk.cyan(
    `\n------ new CreateOne${pascal}ResponseDTO, CreateMany${pascal}sResponseDTO were generated\n`,
  ),
);
console.log(getCreateOneAndManyResponseDTO());

if (!dryRun) {
  await writeFile(
    `./shared/src/types/shared/dto/response_body/mutation/createOneOrMany${pascal}s.dto.ts`,
    getCreateOneAndManyResponseDTO(),
  );
  console.log(
    chalk.gray(
      `\n------ new createOneOrMany${pascal}s.dto was written to disk:\n`,
    ),
  );
  await appendFile(
    `./shared/src/types/shared/dto/response_body/mutation/index.ts`,
    `export * from './createOneOrMany${pascal}s.dto';\n`,
  );
  console.log(
    chalk.gray(
      `\n------ index.ts reexport of createOneOrMany${pascal}s.dto was written to disk:\n`,
    ),
  );
}

console.log(
  chalk.cyan(
    `\n------ new GetOne${pascal}ByIdResponseDTO, FindMany${pascal}sResponseDTO were generated\n`,
  ),
);
console.log(getFindOneOrManyResponseDTO());

if (!dryRun) {
  await writeFile(
    `./shared/src/types/shared/dto/response_body/query/getOneOrMany${pascal}s.dto.ts`,
    getFindOneOrManyResponseDTO(),
  );
  console.log(
    chalk.gray(
      `\n------ new getOneOrMany${pascal}s.dto was written to disk:\n`,
    ),
  );
  await appendFile(
    `./shared/src/types/shared/dto/response_body/query/index.ts`,
    `export * from './getOneOrMany${pascal}s.dto';\n`,
  );
  console.log(
    chalk.gray(
      `\n------ index.ts reexport of getOneOrMany${pascal}s.dto was written to disk:\n`,
    ),
  );
}

console.log(chalk.cyan(`\n------ new AppModule.ts were generated\n`));
const newAppModule = await getNewAppModule();
console.log(newAppModule);

if (!dryRun) {
  await writeFile(`./backend/src/app.module.ts`, newAppModule);
  console.log(chalk.gray(`\n------ new AppModule.ts was written to disk:\n`));
}

console.log(chalk.cyan(`\n------ executed successfully\n`));
