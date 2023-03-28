import { useState } from 'react';
import { Link, Outlet, Navigate } from 'react-router-dom';
import type { ItemType } from 'antd/lib/menu/hooks/useItems';
import { LogoutOutlined } from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-components';
import { Layout, Menu } from 'antd';
import { useTokenPairUpdater, usePath, useLogoutMutation } from 'hooks';
import { ISession, RoutesEnum } from 'types';
import { notAuthedFallbackRoute, routesOnlyForAuthedUsers } from '../routes';

const { Header, Content, Footer, Sider } = Layout;

export function AccountPagesWrapper({
  session,
  deepestPathPart,
  pathParts,
}: AccountPageWrapperProps) {
  const [isMenuCollapsed, setCollapsedMenu] = useState(true);
  const { sendLogoutQuery, isLoading } = useLogoutMutation();

  if (!session.isAuthed)
    return <Navigate to={`/auth/${notAuthedFallbackRoute}`} />;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={isMenuCollapsed}
        onCollapse={setCollapsedMenu}
        width={300}
      >
        <Menu
          theme="dark"
          defaultSelectedKeys={pathParts}
          mode="inline"
          items={[
            ...(Object.entries(routesOnlyForAuthedUsers)
              .map(
                ([
                  path,
                  { menuIcon, menuTitle, canUserOpenThisRoute, isMenuPoint },
                ]) =>
                  canUserOpenThisRoute(session) &&
                  isMenuPoint && {
                    label: <Link to={`/account/${path}`}>{menuTitle}</Link>,
                    key: path,
                    ...(menuIcon && { icon: menuIcon }),
                  },
              )
              .filter((isNotNullable) => isNotNullable) as ItemType[]),
            {
              key: 'empty',
              disabled: true,
            },
            {
              label: 'Выход из аккаунта',
              key: 'logout',
              disabled: isLoading,
              icon: <LogoutOutlined />,
              onClick: () => sendLogoutQuery(),
            },
          ]}
        />
      </Sider>
      <Layout style={{ height: '100vh' }}>
        <Header
          style={{
            background: '#fff',
            padding: 0,
            borderBottom: '1px solid #ddd',
          }}
        >
          <PageHeader
            {...(() => {
              const Extras =
                routesOnlyForAuthedUsers[deepestPathPart as RoutesEnum]?.Extras;
              return Extras ? { extra: <Extras /> } : {};
            })()}
            title={
              routesOnlyForAuthedUsers[deepestPathPart as RoutesEnum]?.pageTitle
            }
            subTitle={
              routesOnlyForAuthedUsers[deepestPathPart as RoutesEnum]
                ?.description
            }
          />
        </Header>
        <Content
          style={{
            background: '#fff',
            overflowX: 'hidden',
            overflowY: 'scroll',
            padding: '10px',
          }}
        >
          <Outlet />
        </Content>
        <Footer style={{ textAlign: 'center', height: '64px' }}>
          Made with ❤️ by nikelborm
        </Footer>
      </Layout>
    </Layout>
  );
}

type AccountPageWrapperProps = { session: ISession } & ReturnType<
  typeof usePath
>;
