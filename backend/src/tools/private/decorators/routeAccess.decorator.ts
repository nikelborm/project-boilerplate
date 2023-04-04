import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { AllowedForArgs } from 'src/types';
import { AccessScopeType, EndpointAccess } from 'src/types';

export const AccessEnum = {
  ...AccessScopeType,
  ...EndpointAccess,
};
export const ALLOWED_SCOPES_KEY = Symbol('ALLOWED_SCOPES_KEY');

export function AllowedFor(...allowedScopes: AllowedForArgs): MethodDecorator {
  return applyDecorators(
    SetMetadata(ALLOWED_SCOPES_KEY, allowedScopes),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

export const Public = (): MethodDecorator => AllowedFor(AccessEnum.PUBLIC);

export const ActiveSessionOnly = (): MethodDecorator =>
  AllowedFor(AccessEnum.GOOD_ACCESS_AND_REFRESH_TOKEN_ONLY);

export const GoodRefreshTokenOnly = (): MethodDecorator =>
  AllowedFor(AccessEnum.GOOD_REFRESH_TOKEN_ONLY);

export const DevelopmentOnly = (): MethodDecorator =>
  AllowedFor(AccessEnum.DEVELOPMENT_ONLY);
