import type { Provider } from '@nestjs/common';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import type { ISecretConfigMap } from 'src/config';
import { ConfigKeys, messages, DI_TypedConfigService } from 'src/config';
import { DI_UserRepo } from 'src/infrastructure';
import { isQueryFailedError, validate } from 'src/tools';
import type {
  BasicUserInfoWithNullableAvatarWithIdDTO,
  CreateUserRequestDTO,
} from 'src/types';
import {
  AccessTokenUserInfoDTO,
  PG_UNIQUE_CONSTRAINT_VIOLATION,
} from 'src/types';
import { DI_UserUseCase } from './di';

@Injectable()
class UserUseCase implements DI_UserUseCase {
  private readonly USER_PASSWORD_HASH_SALT: string;

  constructor(
    private readonly userRepo: DI_UserRepo,
    configService: DI_TypedConfigService<ISecretConfigMap>,
  ) {
    this.USER_PASSWORD_HASH_SALT = configService.get(
      ConfigKeys.USER_PASSWORD_HASH_SALT_SECRET,
    );
  }

  async findMany(
    search?: string,
  ): Promise<BasicUserInfoWithNullableAvatarWithIdDTO[]> {
    return await this.userRepo.findMany(search);
  }

  async getOneByIdAsAccessTokenPayload(
    userId: number,
  ): Promise<AccessTokenUserInfoDTO> {
    const user = await this.userRepo.getOneByIdWithAccessScopes(userId);
    if (!user)
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundById(userId, 'user'),
      );

    const { errors } = validate(user, AccessTokenUserInfoDTO);

    if (errors.length)
      throw new InternalServerErrorException(
        messages.auth.doesNotSatisfyPayloadOfAccessToken(user),
      );

    return user;
  }

  async createManyUsers(
    users: CreateUserRequestDTO[],
  ): Promise<BasicUserInfoWithNullableAvatarWithIdDTO[]> {
    return await Promise.all(users.map((user) => this.createUser(user)));
  }

  async createUser(
    user: CreateUserRequestDTO,
  ): Promise<BasicUserInfoWithNullableAvatarWithIdDTO> {
    try {
      const dirtyUser = await this.userRepo.createOnePlain(
        this.#getModelWithHashedPassword(user),
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

    const { passwordHash, salt } = this.#getModelWithHashedPassword({
      password,
    });

    await this.userRepo.updateOnePlain({ id }, { salt, passwordHash });
  }

  async deleteOne(id: number): Promise<void> {
    await this.userRepo.deleteOneById(id);
  }

  #getModelWithHashedPassword<T extends { password: string }>({
    password,
    ...restUser
  }: T): Omit<T, 'password'> & {
    salt: string;
    passwordHash: string;
  } {
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

  #removeHashAndSalt = <
    T extends {
      salt: string;
      passwordHash: string;
    },
  >({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    passwordHash,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    salt,
    ...rest
  }: T): Omit<T, 'passwordHash' | 'salt'> => rest;
}

export const UserUseCaseDIProvider: Provider = {
  provide: DI_UserUseCase,
  useClass: UserUseCase,
};
