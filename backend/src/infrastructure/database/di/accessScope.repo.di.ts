import type { EntityRepoMethodTypes, IAccessScope } from 'src/types';
import { IDefaultIdRepo } from 'src/types';

export abstract class DI_AccessScopeRepo extends IDefaultIdRepo<RepoTypes> {}

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
