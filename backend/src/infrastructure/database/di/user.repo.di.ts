import type {
  AccessScopeType,
  EntityRepoMethodTypes,
  IUser,
  UserForLoginAttemptValidation,
} from 'src/types';
import { IDefaultIdRepo } from 'src/types';

export abstract class DI_UserRepo extends IDefaultIdRepo<RepoTypes> {
  abstract findMany(
    partOfNameOrEmail?: string,
  ): Promise<RepoTypes['Public']['SelectedOnePlainEntity'][]>;

  abstract getOneByIdWithAccessScopes(
    id: number,
  ): Promise<PlainUserWithPlainAccessScopes | null>;

  abstract getOneByEmailWithAccessScopes(
    email: string,
  ): Promise<PlainUserWithPlainAccessScopes | null>;

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

export type PlainUserWithPlainAccessScopes =
  RepoTypes['Public']['SelectedOnePlainEntity'] & {
    accessScopes: { id: number; type: AccessScopeType }[];
  };
