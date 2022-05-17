import { BadRequestException, Injectable } from '@nestjs/common';
import { model, repo } from '../infrastructure';
import { createHash, randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { messages } from 'src/config';
import { ConfigKeys, IAppConfigMap } from 'src/types';

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
    return await this.userRepo.findManyWithAccessScopes(search);
  }

  async createManyUsers(users: InputUser[]): Promise<InsertedUserModel[]> {
    return await this.userRepo.createManyWithRelations(
      users.map((user) => this.createUserModel(user)),
    );
  }

  async createUser(user: InputUser): Promise<InsertedUserModel> {
    const candidate = await this.userRepo.getOneByEmail(user.email);
    if (candidate) throw new BadRequestException(messages.user.exists);
    return await this.userRepo.createOneWithRelations(
      this.createUserModel(user),
    );
  }

  async setUserPassword(id: number, password: string): Promise<void> {
    const candidate = await this.userRepo.getOneById(id);
    const updatedUser = this.createUserModel({ ...candidate, password });
    return await this.userRepo.updateOnePlain(id, updatedUser);
  }

  private createUserModel({ password, ...rest }: InputUser): UserModelToInsert {
    const salt = randomBytes(64).toString('hex');
    return {
      ...rest,
      salt,
      accessScopes: [],
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

type InsertedUserModel = UserModelToInsert & { id: number };

type UserModelToInsert = Omit<InputUser, 'password'> & {
  salt: string;
  passwordHash: string;
};

interface InputUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  accessScopes: model.AccessScope[];
}
