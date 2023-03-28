import {
  EntityRepoMethodTypes,
  IAccessScope,
  IDefaultEntityWithIdRepo,
} from 'src/types';

export abstract class DI_AccessScopeRepo extends IDefaultEntityWithIdRepo<RepoTypes> {}

export type RepoTypes = EntityRepoMethodTypes<
  IAccessScope,
  {
    EntityName: 'AccessScope';

    RequiredToCreateAndSelectRegularPlainKeys:
      | 'type'
      | 'createdAt'
      | 'updatedAt';

    OptionalToCreateAndSelectRegularPlainKeys: null;

    ForbiddenToCreateGeneratedPlainKeys: 'id' | 'createdAt' | 'updatedAt';
    ForbiddenToUpdatePlainKeys: 'id' | 'createdAt' | 'updatedAt';
    ForbiddenToUpdateRelationKeys: null;

    UnselectedByDefaultPlainKeys: null;
  }
>;
