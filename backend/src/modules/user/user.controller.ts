import { Get, Post, Query, Req } from '@nestjs/common';
import {
  AccessEnum,
  AllowedFor,
  ApiController,
  AuthorizedOnly,
  ValidatedBody,
} from 'src/tools';
import {
  AuthedRequest,
  CreateManyUsersResponseDTO,
  CreateOneUserResponse,
  CreateUserDTO,
  CreateUsersDTO,
  DeleteEntityByIdDTO,
  EmptyResponseDTO,
  FindManyUsersResponseDTO,
  SetMyPasswordDTO,
} from 'src/types';
import { UserUseCase } from './user.useCase';

@ApiController('user')
export class UserController {
  constructor(private readonly userUseCase: UserUseCase) {}

  @Get('all')
  @AuthorizedOnly()
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
    @ValidatedBody
    createUserDTO: CreateUserDTO,
  ): Promise<CreateOneUserResponse> {
    return await this.userUseCase.createUser(createUserDTO);
  }

  @Post('createMany')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async createUsers(
    @ValidatedBody
    { users }: CreateUsersDTO,
  ): Promise<CreateManyUsersResponseDTO> {
    return {
      responses: await this.userUseCase.createManyUsers(users),
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
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async deleteUser(
    @ValidatedBody
    { id }: DeleteEntityByIdDTO,
  ): Promise<EmptyResponseDTO> {
    await this.userUseCase.deleteOne(id);
    return {};
  }
}
