import type { ISession, RouteAccessScopeType } from 'types';

export function canUserUseThisRoute(
  authInfo: ISession,
  allowedForScopeTypes: RouteAccessScopeType[],
) {
  return !allowedForScopeTypes || true;
}
