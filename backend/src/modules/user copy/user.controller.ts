import { Get, Post, Query, Req } from '@nestjs/common';
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
import { ApiController, AuthorizedOnly, ValidatedBody } from 'src/tools';

@ApiController('user')
export class UserController {
  constructor(private readonly userUseCase: UserUseCase) {}

  @Get('all')
  // @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async findManyUsers(
    @Query('search') search?: string,
  ): Promise<FindManyUsersResponseDTO> {
    const users = await this.userUseCase.findMany(search);
    return {
      users,
    };
  }

  @Post('create')
  // @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async createUser(
    @ValidatedBody
    createUserDTO: CreateUserDTO,
  ): Promise<CreateOneUserResponse> {
    const user = await this.userUseCase.createUser(createUserDTO);
    return {
      user,
    };
  }

  @Post('createMany')
  // @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async createUsers(
    @ValidatedBody
    { users }: CreateUsersDTO,
  ): Promise<CreateManyUsersResponseDTO> {
    const userModels = await this.userUseCase.createManyUsers(
      users.map((user) => ({ ...user, userGroups: [] })),
    );
    return {
      users: userModels,
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
    return {};
  }

  @Post('deleteById')
  // @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async deleteUser(
    @ValidatedBody
    { id }: DeleteEntityByIdDTO,
  ): Promise<EmptyResponseDTO> {
    await this.userUseCase.deleteOne(id);
    return {};
  }
}
