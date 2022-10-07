import { Profile, Login, Registration, Root } from 'pages';
import { UserOutlined } from '@ant-design/icons';
import {
  RoutesEnum,
  AuthedRouteEntity,
  RoutesMap,
  SimpleRouteEntity,
  ISession,
} from 'types';

export const publicRoutes: RoutesMap<SimpleRouteEntity> = {
  [RoutesEnum.ROOT]: {
    Component: Root,
  },
  // [RoutesEnum.ERROR_404]: {
  //   Component: Error404,
  // },
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
    menuIcon: <UserOutlined />,
    canUserOpenThisRoute: () => true,
    Extras: () => 'Extras react component',
  },
  [RoutesEnum.USER]: {
    Component: Profile,
    menuTitle: 'User menu item',
    pageTitle: 'User page header',
    description: 'User desc',
    menuIcon: <UserOutlined />,
    canUserOpenThisRoute: () => true,
    Extras: () => 'Extras react component',
  },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getAuthedFallbackRoute = (session: ISession) => RoutesEnum.PROFILE;

export const notAuthedFallbackRoute = RoutesEnum.LOGIN;
export const publicFallbackRoute = RoutesEnum.ROOT;
