import type { AccessScopeType } from '../shared/accessScopeType';

export enum EndpointAccess {
  PUBLIC = 'public',
  FORBIDDEN = 'forbidden',
  AUTHORIZED = 'authorized',
  UNAUTHORIZED_ONLY = 'unauthorizedOnly',
  DEVELOPMENT_ONLY = 'developmentOnly',
}

export type IAccessEnum = AccessScopeType | EndpointAccess;
export type UserLevelScopes = AccessScopeType | AccessScopeType[];
export type AllowedForArgs = (EndpointAccess | UserLevelScopes)[];
