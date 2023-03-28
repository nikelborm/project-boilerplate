import {
  EntityRepoMethodTypes,
  IDefaultEntityWithIdRepo,
  IUser,
  UserAuthInfo,
  UserForLoginAttemptValidation,
} from 'src/types';

export abstract class DI_UserRepo extends IDefaultEntityWithIdRepo<RepoTypes> {
  abstract findMany(
    partOfNameOrEmail?: string,
  ): Promise<RepoTypes['Public']['SelectedOnePlainEntity'][]>;

  abstract getOneByIdWithAccessScopes(id: number): Promise<UserAuthInfo | null>;

  abstract findOneByExactEmail(
    userEmail: string,
  ): Promise<RepoTypes['Public']['SelectedOnePlainEntity'] | null>;

  abstract findOneByExactName(
    firstName: string,
    lastName: string,
  ): Promise<RepoTypes['Public']['SelectedOnePlainEntity'] | null>;

  abstract findOneByEmailWithAccessScopesAndPasswordHash(
    email: string,
  ): Promise<UserForLoginAttemptValidation | null>;
}

export type RepoTypes = EntityRepoMethodTypes<
  IUser,
  {
    EntityName: 'User';
    RequiredToCreateAndSelectRegularPlainKeys:
      | 'firstName'
      | 'lastName'
      | 'nickname'
      | 'email'
      | 'patronymic'
      | 'gender'
      | 'salt'
      | 'passwordHash'
      | 'createdAt'
      | 'updatedAt';
    OptionalToCreateAndSelectRegularPlainKeys: 'avatarURL' | 'phone';

    ForbiddenToCreateGeneratedPlainKeys: 'id' | 'createdAt' | 'updatedAt';
    ForbiddenToUpdatePlainKeys: 'id' | 'createdAt' | 'updatedAt';
    ForbiddenToUpdateRelationKeys: null;
    UnselectedByDefaultPlainKeys: 'salt' | 'passwordHash';
  }
>;
