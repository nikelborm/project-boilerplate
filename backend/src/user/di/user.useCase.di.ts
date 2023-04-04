import type {
  BasicUserInfoWithNullableAvatarWithIdDTO,
  CreateUserRequestDTO,
  AccessTokenUserInfoDTO,
} from 'src/types';

export abstract class DI_UserUseCase {
  abstract findMany(
    search?: string,
  ): Promise<BasicUserInfoWithNullableAvatarWithIdDTO[]>;

  abstract getOneByIdAsAccessTokenPayload(
    userId: number,
  ): Promise<AccessTokenUserInfoDTO>;

  abstract createManyUsers(
    users: CreateUserRequestDTO[],
  ): Promise<BasicUserInfoWithNullableAvatarWithIdDTO[]>;

  abstract createUser(
    user: CreateUserRequestDTO,
  ): Promise<BasicUserInfoWithNullableAvatarWithIdDTO>;

  public abstract setUserPassword(id: number, password: string): Promise<void>;

  abstract deleteOne(id: number): Promise<void>;
}
