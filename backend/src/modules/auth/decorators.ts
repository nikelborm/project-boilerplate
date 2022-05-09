import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AccessScopeType } from 'src/types';

export enum EndpointAccess {
  PUBLIC = 'public',
  FORBIDDEN = 'forbidden',
  AUTHORIZED = 'authorized',
  DEVELOPMENT_ONLY = 'developmentOnly',
}

export type IAccessEnum = AccessScopeType | EndpointAccess;
export const AccessEnum = { ...AccessScopeType, ...EndpointAccess };
export type UserLevelScopes = AccessScopeType | AccessScopeType[];

export const ALLOWED_SCOPES_KEY = Symbol('ALLOWED_SCOPES_KEY');

export type AllowedForArgs = (EndpointAccess | UserLevelScopes)[];

export function AllowedFor(...allowedScopes: AllowedForArgs) {
  return applyDecorators(
    SetMetadata(ALLOWED_SCOPES_KEY, allowedScopes),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

export const Public = () => AllowedFor(AccessEnum.PUBLIC);
export const AuthorizedOnly = () => AllowedFor(AccessEnum.AUTHORIZED);
export const DevelopmentOnly = () => AllowedFor(AccessEnum.DEVELOPMENT_ONLY);
