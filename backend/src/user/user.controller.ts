import { Get, Post, Query, Req } from '@nestjs/common';
import {
  AccessEnum,
  AllowedFor,
  ApiController,
  ActiveSessionOnly,
  ValidatedBody,
} from 'src/tools';
import type {
  CreateManyUsersResponseDTO,
  CreateOneUserResponseDTO,
  EmptyResponseDTO,
  FindManyUsersResponseDTO,
} from 'src/types';
import {
  AuthorizedRequest,
  CreateUserRequestDTO,
  CreateUsersRequestDTO,
  DeleteEntityByIdDTO,
  SetMyPasswordDTO,
} from 'src/types';
import { DI_UserUseCase } from './di';

@ApiController('user')
export class UserController {
  constructor(private readonly userUseCase: DI_UserUseCase) {}

  @Get('all')
  @ActiveSessionOnly()
  async findManyUsers(
    @Query('search') search?: string,
  ): Promise<FindManyUsersResponseDTO> {
    const users = await this.userUseCase.findMany(search);
    return {
      users,
    };
  }

  @Post('create')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async createUser(
    @ValidatedBody()
    createUserDTO: CreateUserRequestDTO,
  ): Promise<CreateOneUserResponseDTO> {
    const user = await this.userUseCase.createUser(createUserDTO);
    return { user };
  }

  @Post('createMany')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async createUsers(
    @ValidatedBody()
    { users }: CreateUsersRequestDTO,
  ): Promise<CreateManyUsersResponseDTO> {
    const createdUsers = await this.userUseCase.createManyUsers(users);
    return {
      createdUsers,
    };
  }

  @Post('setMyPassword')
  @ActiveSessionOnly()
  async setMyPassword(
    @Req() { user }: AuthorizedRequest,
    @ValidatedBody()
    { password }: SetMyPasswordDTO,
  ): Promise<EmptyResponseDTO> {
    await this.userUseCase.setUserPassword(user.id, password);
    return {};
  }

  @Post('deleteById')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async deleteUser(
    @ValidatedBody()
    { id }: DeleteEntityByIdDTO,
  ): Promise<EmptyResponseDTO> {
    await this.userUseCase.deleteOne(id);
    return {};
  }
}
