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
  CreateOneUserResponse,
  CreateUserDTO,
  PG_UNIQUE_CONSTRAINT_VIOLATION,
} from 'src/types';
import { model, repo } from '../infrastructure';

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

  async findMany(search?: string): Promise<model.User[]> {
    return await this.userRepo.findMany(search);
  }

  async createManyUsers(
    users: CreateUserDTO[],
  ): Promise<CreateOneUserResponse[]> {
    return await Promise.all(users.map(this.createUser));
  }

  async createUser(user: CreateUserDTO): Promise<CreateOneUserResponse> {
    let userWithoutSensitiveDataWithId: BasicUserInfoWithIdDTO;
    try {
      userWithoutSensitiveDataWithId = (({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        passwordHash,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        salt,
        ...rest
      }: InsertedUserModel): BasicUserInfoWithIdDTO => rest)(
        await this.userRepo.createOneWithRelations(this.createUserModel(user)),
      );
    } catch (error: any) {
      if (isQueryFailedError(error))
        if (error.code === PG_UNIQUE_CONSTRAINT_VIOLATION)
          throw new BadRequestException(messages.user.exists);
      throw error;
    }

    return {
      user: userWithoutSensitiveDataWithId,
    };
  }

  async setUserPassword(id: number, password: string): Promise<void> {
    const candidate = await this.userRepo.getOneById(id);

    const updatedUser = this.createUserModel({ ...candidate, password });
    return await this.userRepo.updateOnePlain({ id, ...updatedUser });
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
    await this.userRepo.delete(id);
  }
}

type UserModelToInsert = BasicUserInfoDTO & {
  salt: string;
  passwordHash: string;
};

type InsertedUserModel = UserModelToInsert & {
  id: number;
};
