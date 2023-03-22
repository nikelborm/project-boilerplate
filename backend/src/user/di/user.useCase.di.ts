import {
  BasicUserInfoWithNullableAvatarWithIdDTO,
  CreateUserRequestDTO,
  UserAuthInfo,
} from 'src/types';

export abstract class DI_UserUseCase {
  abstract findMany(
    search?: string,
  ): Promise<BasicUserInfoWithNullableAvatarWithIdDTO[]>;

  abstract getOneByIdWithAccessScopes(userId: number): Promise<UserAuthInfo>;

  abstract createManyUsers(
    users: CreateUserRequestDTO[],
  ): Promise<BasicUserInfoWithNullableAvatarWithIdDTO[]>;

  abstract createUser(
    user: CreateUserRequestDTO,
  ): Promise<BasicUserInfoWithNullableAvatarWithIdDTO>;

  public abstract setUserPassword(id: number, password: string): Promise<void>;

  abstract deleteOne(id: number): Promise<void>;
}
