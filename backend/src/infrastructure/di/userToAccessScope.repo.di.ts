import {
  EntityRepoMethodTypes,
  IDefaultEntityWithIdentityRepo,
  IUserToAccessScope,
} from 'src/types';

export abstract class DI_UserToAccessScopeRepo extends IDefaultEntityWithIdentityRepo<RepoTypes> {}

export type RepoTypes = EntityRepoMethodTypes<
  IUserToAccessScope,
  {
    EntityName: 'UserToAccessScope';

    RequiredToCreateAndSelectRegularPlainKeys: 'userId' | 'accessScopeId';

    OptionalToCreateAndSelectRegularPlainKeys: null;

    ForbiddenToCreateGeneratedPlainKeys: null;
    ForbiddenToUpdatePlainKeys: 'userId' | 'accessScopeId';
    ForbiddenToUpdateRelationKeys: null;
    UnselectedByDefaultPlainKeys: null;
  }
>;
