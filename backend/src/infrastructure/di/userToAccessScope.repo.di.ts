import {
  EntityRepoMethodTypes,
  IDefaultEntityRepo,
  IUserToAccessScope,
} from 'src/types';

export abstract class DI_UserToAccessScopeRepo extends IDefaultEntityRepo<RepoTypes> {}

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
