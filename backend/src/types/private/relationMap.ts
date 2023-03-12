// import type { RelationMapMaximizedType } from './relationMapMaximizedType';

// uncomment type to enable intellisense
const RelationMapValue /* : RelationMapMaximizedType */ = {
  AccessScope: {
    identityKeys: ['id'],
    relationToEntityNameMap: {
      // AccessScope relationToEntityNameMap token
      usersWithThatAccessScope: ['User'],
      userToAccessScopeRelations: ['UserToAccessScope'],
    },
  },
  User: {
    identityKeys: ['id'],
    relationToEntityNameMap: {
      // User relationToEntityNameMap token
      userToAccessScopeRelations: ['UserToAccessScope'],
      accessScopes: ['AccessScope'],
    },
  },
  UserToAccessScope: {
    identityKeys: ['accessScopeId', 'userId'],
    relationToEntityNameMap: {
      // UserToAccessScope relationToEntityNameMap token
      accessScope: 'AccessScope',
      user: 'User',
    },
  },
  // RelationMapValue end token
} as const;

//! Do not remove "Entity relationToEntityNameMap token" and "RelationMapValue end token"
//! because it will break code auto generation

export type RelationMap = typeof RelationMapValue;
