import React from 'react';
import { ISession } from './localStorageAuth';

export enum RoutesEnum {
  /* 1 */ LOGIN = 'login',
  /* 2 */ REGISTRATION = 'registration',
  /* 3 */ PROFILE = 'profile',
  /* 4 */ USER = 'user/:id',
  /* 5 */ ROOT = '/', // landing
  /* 6 */ ERROR_404 = '404',
}

export interface SimpleRouteEntity {
  Component: React.FC<React.PropsWithChildren<any>>;
}

export interface AuthedRouteEntity extends SimpleRouteEntity {
  Component: React.FC<React.PropsWithChildren<any>>;
  isMenuPoint?: boolean;
  menuTitle?: React.ReactNode;
  pageTitle?: React.ReactNode;
  description?: React.ReactNode;
  menuIcon?: React.ReactElement;
  canUserOpenThisRoute(session: ISession): boolean;
  Extras?: React.FC<React.PropsWithChildren<any>>;
}

export type RoutesMap<T> = {
  [route in RoutesEnum]?: T;
};
