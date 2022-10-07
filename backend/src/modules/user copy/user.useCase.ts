import { BadRequestException, Injectable } from '@nestjs/common';
import { model, repo } from '../infrastructure';
import { createHash, randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { messages } from 'src/config';
import {
  ClearedInsertedUserDTO,
  ConfigKeys,
  IAppConfigMap,
  InputUser,
  PG_UNIQUE_CONSTRAINT_VIOLATION,
} from 'src/types';
import { isQueryFailedError } from 'src/tools';

@Injectable()
export class UserUseCase {
  private USER_PASSWORD_HASH_SALT: string;

  constructor(
    private readonly userRepo: repo.UserRepo,
    private readonly configService: ConfigService<IAppConfigMap, true>,
  ) {
    this.USER_PASSWORD_HASH_SALT = this.configService.get(
      ConfigKeys.USER_PASSWORD_HASH_SALT,
    );
  }

  async findMany(search?: string): Promise<model.User[]> {
    return await this.userRepo.findMany(search);
  }

  async createManyUsers(users: InputUser[]): Promise<ClearedInsertedUserDTO[]> {
    return await this.userRepo.createManyWithRelations(
      users.map((user) => this.createUserModel(user)),
    );
  }

  async createUser(user: InputUser): Promise<ClearedInsertedUserDTO> {
    /* eslint-disable @typescript-eslint/no-unused-vars, prettier/prettier */
    let userWithoutSensitiveData: ClearedInsertedUserDTO;

    try {
      userWithoutSensitiveData = (({ passwordHash, salt, ...rest }): ClearedInsertedUserDTO => rest)(
        await this.userRepo.createOneWithRelations(this.createUserModel(user)),
      );
    } catch (error: any) {
      if(isQueryFailedError(error))
        if (error.code === PG_UNIQUE_CONSTRAINT_VIOLATION)
          throw new BadRequestException(messages.user.exists);
      throw error;
    }

    return userWithoutSensitiveData;
    /* eslint-enable @typescript-eslint/no-unused-vars, prettier/prettier */
  }

  async setUserPassword(id: number, password: string): Promise<void> {
    const candidate = await this.userRepo.getOneById(id);

    const updatedUser = this.createUserModel({ ...candidate, password });
    return await this.userRepo.updateOnePlain({ id, ...updatedUser });
  }

  private createUserModel({ password, ...rest }: InputUser): UserModelToInsert {
    const salt = randomBytes(64).toString('hex');
    return {
      ...rest,
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

type UserModelToInsert = Omit<InputUser, 'password'> & {
  salt: string;
  passwordHash: string;
};
