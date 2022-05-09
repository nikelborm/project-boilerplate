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

  getOneById(id: number) {
    return this.userRepo.getOneById(id);
  }

  getOneByName(name: { firstName: string; lastName: string }) {
    return this.userRepo.findOneByName(name.firstName, name.lastName);
  }

  deleteOne(id: number) {
    return this.userRepo.delete(id);
  }

  async findMany(search?: string) {
    return await this.userRepo.findManyWithAccessScopes(search);
  }

  createManyUsers(users: InputUser[]) {
    return this.userRepo.createManyWithRelations(
      users.map((user) => this.createUserModel(user)),
    );
  }

  async createUser(user: InputUser) {
    const candidate = await this.userRepo.getOneByEmail(user.email);
    if (candidate) throw new BadRequestException(messages.user.exists);
    return await this.userRepo.createOneWithRelations(
      this.createUserModel(user),
    );
  }

  async setUserPassword(id: number, password: string) {
    const candidate = await this.userRepo.getOneById(id);
    const updatedUser = this.createUserModel({ ...candidate, password });
    return this.userRepo.updateOnePlain(id, updatedUser);
  }

  private createUserModel({ password, ...rest }: InputUser) {
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
}

interface InputUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  accessScopes?: model.AccessScope[];
}
