import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import {
  ConfigKeys,
  IAppConfigMap,
  messages,
  TypedConfigService,
} from 'src/config';
import { isQueryFailedError } from 'src/tools';
import {
  BasicUserInfoDTO,
  BasicUserInfoWithIdDTO,
  CreateUserDTO,
  PG_UNIQUE_CONSTRAINT_VIOLATION,
  UserAuthInfo,
} from 'src/types';
import { repo } from '../infrastructure';

@Injectable()
export class UserUseCase {
  private readonly USER_PASSWORD_HASH_SALT: string;

  constructor(
    private readonly userRepo: repo.UserRepo,
    private readonly configService: TypedConfigService<IAppConfigMap>,
  ) {
    this.USER_PASSWORD_HASH_SALT = this.configService.get(
      ConfigKeys.USER_PASSWORD_HASH_SALT,
    );
  }

  async findMany(search?: string): Promise<BasicUserInfoWithIdDTO[]> {
    return await this.userRepo.findMany(search);
  }

  async getOneByIdWithAccessScopes(userId: number): Promise<UserAuthInfo> {
    const user = await this.userRepo.getOneByIdWithAccessScopes(userId);
    if (!user)
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundById(userId, 'user'),
      );
    return user;
  }

  async createManyUsers(
    users: CreateUserDTO[],
  ): Promise<BasicUserInfoWithIdDTO[]> {
    return await Promise.all(users.map(this.createUser));
  }

  async createUser(user: CreateUserDTO): Promise<BasicUserInfoWithIdDTO> {
    try {
      const dirtyUser = await this.userRepo.createOnePlain(
        this.createUserModel(user),
      );
      return this.#removeHashAndSalt(dirtyUser);
    } catch (error: any) {
      if (isQueryFailedError(error))
        if (error.code === PG_UNIQUE_CONSTRAINT_VIOLATION)
          throw new BadRequestException(messages.user.exists);
      throw error;
    }
  }

  async setUserPassword(id: number, password: string): Promise<void> {
    const candidate = await this.userRepo.findOneById(id); // to check if user exists

    if (!candidate)
      throw new BadRequestException(messages.repo.user.cantGetNotFoundById(id));

    const updatedUser = this.createUserModel({ ...candidate, password });

    await this.userRepo.updateOnePlain({ id }, updatedUser);
  }

  private createUserModel({
    password,
    ...restUser
  }: CreateUserDTO): UserModelToInsert {
    const salt = randomBytes(64).toString('hex');
    return {
      ...restUser,
      salt,
      passwordHash: createHash('sha256')
        .update(salt)
        .update(password)
        .update(this.USER_PASSWORD_HASH_SALT)
        .digest('hex'),
    };
  }

  async deleteOne(id: number): Promise<void> {
    await this.userRepo.deleteOneById(id);
  }

  #removeHashAndSalt = ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    passwordHash,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    salt,
    ...rest
  }: InsertedUserModel): BasicUserInfoWithIdDTO => rest;
}

type UserModelToInsert = BasicUserInfoDTO & {
  salt: string;
  passwordHash: string;
};

type InsertedUserModel = UserModelToInsert & {
  id: number;
};
