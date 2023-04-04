import type { RelationMapMaximizedType } from './relationMapMaximizedType';

//! if you change this file manually, do it very carefully

const RelationMapValue = {
  AccessScope: {
    identityKeys: ['id'],
    relationToEntityNameMap: {
      usersWithThatAccessScope: ['User'],
      userToAccessScopeRelations: ['UserToAccessScope'],
      // AccessScope relationToEntityNameMap token
    },
  },
  UserToAccessScope: {
    identityKeys: ['accessScopeId', 'userId'],
    relationToEntityNameMap: {
      accessScope: 'AccessScope',
      user: 'User',
      // UserToAccessScope relationToEntityNameMap token
    },
  },
  User: {
    identityKeys: ['id'],
    relationToEntityNameMap: {
      userToAccessScopeRelations: ['UserToAccessScope'],
      accessScopes: ['AccessScope'],
      // User relationToEntityNameMap token
    },
  },
  // RelationMapValue end token
} as const satisfies RelationMapMaximizedType;

//! Do not remove "Entity relationToEntityNameMap token" and "RelationMapValue end token"
//! because it will break code auto generation

export type RelationMap = typeof RelationMapValue;
