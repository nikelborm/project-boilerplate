import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AccessScopeType, EndpointAccess, AllowedForArgs } from 'src/types';

export const AccessEnum = { ...AccessScopeType, ...EndpointAccess };
export const ALLOWED_SCOPES_KEY = Symbol('ALLOWED_SCOPES_KEY');

export function AllowedFor(...allowedScopes: AllowedForArgs): MethodDecorator {
  return applyDecorators(
    SetMetadata(ALLOWED_SCOPES_KEY, allowedScopes),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

export const Public = (): MethodDecorator => AllowedFor(AccessEnum.PUBLIC);

export const AuthorizedOnly = (): MethodDecorator =>
  AllowedFor(AccessEnum.AUTHORIZED);

export const DevelopmentOnly = (): MethodDecorator =>
  AllowedFor(AccessEnum.DEVELOPMENT_ONLY);
