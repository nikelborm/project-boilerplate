import type { DBModelNames } from './modelNames';
import type * as model from '../shared/model';

export type RelationMapMaximizedType = {
  [ModelName in DBModelNames]: `I${ModelName}` extends keyof typeof model
    ? {
        identityKeys: readonly (keyof InstanceType<
          (typeof model)[`I${ModelName}`]
        >)[];
        relationToEntityNameMap: {
          [RelationKey in keyof InstanceType<
            (typeof model)[`I${ModelName}`]
          >]?: DBModelNames | readonly [DBModelNames];
        };
      }
    : never;
};

// uncomment type to enable intellisense
const RelationMapValue /* : RelationMapMaximizedType */ = {
  AccessScope: {
    identityKeys: ['id'],
    relationToEntityNameMap: {
      usersWithThatAccessScope: ['User'],
      userToAccessScopeRelations: ['UserToAccessScope'],
    },
  },
  User: {
    identityKeys: ['id'],
    relationToEntityNameMap: {
      userToAccessScopeRelations: ['UserToAccessScope'],
      accessScopes: ['AccessScope'],
    },
  },
  UserToAccessScope: {
    identityKeys: ['accessScopeId', 'userId'],
    relationToEntityNameMap: {
      accessScope: 'AccessScope',
      user: 'User',
    },
  },
} as const;

export type RelationMap = typeof RelationMapValue;
