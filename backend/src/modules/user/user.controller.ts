import { Controller, Get, Post, Query, Req } from '@nestjs/common';
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
  AuthedRequest,
} from 'src/types';
import {
  AccessEnum,
  AllowedFor,
  AuthorizedOnly,
  ValidatedBody,
} from 'src/tools';

@ApiTags('user')
@Controller()
export class UserController {
  constructor(private readonly userUseCase: UserUseCase) {}

  @Get('users')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
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

  @Post('createUser')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async createUser(
    @ValidatedBody
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

  @Post('createUsers')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async createUsers(
    @ValidatedBody
    { users }: CreateUsersDTO,
  ): Promise<CreateManyUsersResponseDTO> {
    const userModels = await this.userUseCase.createManyUsers(
      users.map((user) => ({ ...user, accessScopes: [] })),
    );
    return {
      response: {
        users: userModels,
      },
    };
  }

  @Post('setMyPassword')
  @AuthorizedOnly()
  async setMyPassword(
    @Req() { user }: AuthedRequest,
    @ValidatedBody
    { password }: SetMyPasswordDTO,
  ): Promise<EmptyResponseDTO> {
    await this.userUseCase.setUserPassword(user.id, password);
    return { response: {} };
  }

  @Post('deleteUserById')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async deleteUser(
    @ValidatedBody
    { id }: DeleteEntityByIdDTO,
  ): Promise<EmptyResponseDTO> {
    await this.userUseCase.deleteOne(id);
    return { response: {} };
  }
}
