import { Profile, Login, Registration, Root } from 'pages';
import { UserOutlined } from '@ant-design/icons';
import { RoutesEnum, RouteAccessScopeType } from 'types';
import type { AuthedRouteEntity, RoutesMap, SimpleRouteEntity } from 'types';

export const publicRoutes: RoutesMap<SimpleRouteEntity> = {
  [RoutesEnum.ROOT]: {
    Component: Root,
  },
};

export const routesOnlyForNotAuthedUsers: RoutesMap<SimpleRouteEntity> = {
  [RoutesEnum.LOGIN]: {
    Component: Login,
  },
  [RoutesEnum.REGISTRATION]: {
    Component: Registration,
  },
};

export const routesOnlyForAuthedUsers: RoutesMap<AuthedRouteEntity> = {
  [RoutesEnum.PROFILE]: {
    Component: Profile,
    isMenuPoint: true,
    menuTitle: 'Profile menu item',
    pageTitle: 'Profile page header',
    description: 'Профиль',
    allowedForScopeTypes: [RouteAccessScopeType.REGULAR_USER],
    menuIcon: <UserOutlined />,
  },
  [RoutesEnum.USER]: {
    Component: Profile,
    menuTitle: 'User menu item',
    pageTitle: 'User page header',
    description: 'User desc',
    allowedForScopeTypes: [RouteAccessScopeType.REGULAR_USER],
    menuIcon: <UserOutlined />,
  },
};

export const getAuthedFallbackRoute = (authInfo: Record<string, any>) => (
  console.log('authInfo: ', authInfo), RoutesEnum.PROFILE
);

export const notAuthedFallbackRoute = RoutesEnum.LOGIN;
export const publicFallbackRoute = RoutesEnum.ROOT;
