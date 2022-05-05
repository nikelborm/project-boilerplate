import { Profile, Login, Registration, Root } from 'pages';
import { UserOutlined } from '@ant-design/icons';
import {
  AuthedRouteEntity,
  RouteAccessScopeType,
  RoutesMap,
  RoutesEnum,
  SimpleRouteEntity,
} from 'types';

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
    menuTitle: 'Profile menu item',
    pageTitle: 'Profile page header',
    description: 'Профиль',
    allowedForScopeTypes: [RouteAccessScopeType.REGULAR_USER],
    menuIcon: <UserOutlined />,
  },
};

export const authedFallbackRoute = RoutesEnum.PROFILE;
export const notAuthedFallbackRoute = RoutesEnum.LOGIN;
export const publicFallbackRoute = RoutesEnum.ROOT;
