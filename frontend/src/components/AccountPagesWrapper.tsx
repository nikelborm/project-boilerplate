import { useState } from 'react';
import { Link, Outlet, Navigate } from 'react-router-dom';
import type { ItemType } from 'antd/lib/menu/hooks/useItems';
import { LogoutOutlined } from '@ant-design/icons';
import { Layout, PageHeader, Menu } from 'antd';
import { useTokenPairUpdater, usePath } from 'hooks';
import { ISession, RoutesEnum } from 'types';
import { notAuthedFallbackRoute, routesOnlyForAuthedUsers } from '../routes';

const { Header, Content, Footer, Sider } = Layout;

export function AccountPagesWrapper({
  session,
  deepestPathPart,
  pathParts,
}: AccountPageWrapperProps) {
  const [isMenuCollapsed, setCollapsedMenu] = useState(false);
  const { updateTokenPair } = useTokenPairUpdater();

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
              icon: <LogoutOutlined />,
              onClick: () => updateTokenPair(null),
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }}>
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
        <div style={{ margin: '16px', opacity: '0' }} />
        <div style={{ height: '85vh', overflowX: 'scroll' }}>
          <Content style={{ margin: '0 16px' }}>
            <div style={{ background: '#fff', padding: 24, minHeight: 360 }}>
              <Outlet />
            </div>
          </Content>
        </div>
        <Footer style={{ textAlign: 'center' }}>
          Made with ❤️ by nikelborm
        </Footer>
      </Layout>
    </Layout>
  );
}

type AccountPageWrapperProps = { session: ISession } & ReturnType<
  typeof usePath
>;
