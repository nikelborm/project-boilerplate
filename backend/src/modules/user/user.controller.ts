import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserUseCase } from './user.useCase';
import {
  CreateUserDTO,
  CreateUsersDTO,
  DeleteEntityByIdDTO,
  EmptyResponseDTO,
  FindManyUsersResponseDTO,
  CreateOneUserResponse,
  CreateManyUsersResponseDTO,
  SetMyPasswordDTO,
} from 'src/types';
import { AccessEnum, AllowedFor, AuthedRequest, AuthorizedOnly } from '../auth';

@ApiTags('user')
@Controller('/api')
export class UserController {
  constructor(private readonly userUseCase: UserUseCase) {}

  @Get('/users')
  @AllowedFor(AccessEnum.USER_VIEW)
  async findManyUsers(
    @Query('search') search?: string,
  ): Promise<FindManyUsersResponseDTO> {
    const users = await this.userUseCase.findMany(search);
    return {
      response: {
        users,
      },
    };
  }

  @Post('/createUser')
  @AllowedFor(AccessEnum.USER_CREATE)
  async createUser(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    { firstName, lastName, email, password }: CreateUserDTO,
  ): Promise<CreateOneUserResponse> {
    const user = await this.userUseCase.createUser({
      firstName,
      lastName,
      email,
      password,
      accessScopes: [],
    });
    return {
      response: {
        user,
      },
    };
  }

  @Post('/createUsers')
  @AllowedFor(AccessEnum.USER_CREATE)
  async createUsers(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    { users }: CreateUsersDTO,
  ): Promise<CreateManyUsersResponseDTO> {
    const userModels = await this.userUseCase.createManyUsers(users);
    return {
      response: {
        users: userModels,
      },
    };
  }

  @Post('/setMyPassword')
  @AuthorizedOnly()
  async setMyPassword(
    @Req() { user }: AuthedRequest,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    { password }: SetMyPasswordDTO,
  ): Promise<EmptyResponseDTO> {
    await this.userUseCase.setUserPassword(user.id, password);
    return { response: {} };
  }

  @Post('/deleteUserById')
  @AllowedFor(AccessEnum.USER_DELETE)
  async deleteUser(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    { id }: DeleteEntityByIdDTO,
  ): Promise<EmptyResponseDTO> {
    await this.userUseCase.deleteOne(id);
    return { response: {} };
  }
}
