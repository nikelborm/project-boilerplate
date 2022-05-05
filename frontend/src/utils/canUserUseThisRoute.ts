import type { RouteAccessScopeType } from 'types';

export function canUserUseThisRoute(
  authInfo: Record<string, any>,
  allowedForScopeTypes: RouteAccessScopeType[],
) {
  return true;
}
