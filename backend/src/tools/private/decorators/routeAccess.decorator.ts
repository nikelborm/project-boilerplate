import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { UserLevelScopes } from 'src/types';
import { AccessScopeType, EndpointAccess } from 'src/types';

export const AccessEnum = {
  ...AccessScopeType,
  ...EndpointAccess,
};
export const ALLOWED_SCOPES_KEY = Symbol('ALLOWED_SCOPES_KEY');

export function RouteLevelAccessFor(
  routeLevelScope: EndpointAccess,
  ...userLevelScopes: UserLevelScopes[]
): MethodDecorator {
  return applyDecorators(
    SetMetadata(ALLOWED_SCOPES_KEY, [routeLevelScope, ...userLevelScopes]),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

export function AllowedFor(
  ...allowedForUserLevelScopes: UserLevelScopes[]
): MethodDecorator {
  return RouteLevelAccessFor(
    AccessEnum.GOOD_ACCESS_AND_REFRESH_TOKEN_ONLY,
    ...allowedForUserLevelScopes,
  );
}

export const Public = (): MethodDecorator =>
  RouteLevelAccessFor(AccessEnum.PUBLIC);

export const ActiveSessionOnly = (): MethodDecorator =>
  RouteLevelAccessFor(AccessEnum.GOOD_ACCESS_AND_REFRESH_TOKEN_ONLY);

export const GoodRefreshTokenOnly = (): MethodDecorator =>
  RouteLevelAccessFor(AccessEnum.GOOD_REFRESH_TOKEN_ONLY);

export const DevelopmentOnly = (): MethodDecorator =>
  RouteLevelAccessFor(AccessEnum.DEVELOPMENT_ONLY);
