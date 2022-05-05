export enum RoutesEnum {
  LOGIN = 'login',
  REGISTRATION = 'registration',
  PROFILE = 'profile',
  USER = 'user/:id',
  ROOT = '/',
}

export enum RouteAccessScopeType {
  ADMIN = 'admin',
  REGULAR_USER = 'regularUser',
}

export interface SimpleRouteEntity {
  Component: React.FC<React.PropsWithChildren<any>>;
}

export interface AuthedRouteEntity extends SimpleRouteEntity {
  Component: React.FC<React.PropsWithChildren<any>>;
  allowedForScopeTypes: RouteAccessScopeType[];
  isMenuPoint?: boolean;
  menuTitle?: string;
  pageTitle?: string;
  description?: string;
  menuIcon?: React.ReactElement;
}

export type RoutesMap<T> = {
  [route in RoutesEnum]?: T;
};
