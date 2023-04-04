import type { AccessScopeType } from '../shared';

export enum EndpointAccess {
  PUBLIC = 'public',
  FORBIDDEN = 'forbidden',
  GOOD_ACCESS_AND_REFRESH_TOKEN_ONLY = 'goodAccessAndRefreshTokenOnly',
  GOOD_REFRESH_TOKEN_ONLY = 'goodRefreshTokenOnly',
  UNAUTHORIZED_ONLY = 'unauthorizedOnly',
  DEVELOPMENT_ONLY = 'developmentOnly',
}

export type IAccessEnum = AccessScopeType | EndpointAccess;
export type UserLevelScopes = AccessScopeType | AccessScopeType[];
export type AllowedForArgs = (EndpointAccess | UserLevelScopes)[];
