import { useState } from 'react';
import { Link, Outlet, Navigate } from 'react-router-dom';
import { Layout, Menu, PageHeader } from 'antd';
import { useAuthContextUpdater, useAuthedUser, usePath } from 'hooks';
import { RoutesEnum } from 'types';
import {
  authedFallbackRoute,
  notAuthedFallbackRoute,
  routesOnlyForAuthedUsers,
} from 'routes';

const { Header, Content, Footer, Sider } = Layout;

export function AdminPanelWrapper({
  isAuthed,
  deepestPathPart,
  pathParts,
}: AdminPanelWrapperProps) {
  const [isMenuCollapsed, setCollapsedMenu] = useState(false);
  const { updateAuthContext } = useAuthContextUpdater();

  if (deepestPathPart === 'adminPanel')
    return <Navigate to={authedFallbackRoute} />;

  if (!isAuthed) return <Navigate to={`/auth/${notAuthedFallbackRoute}`} />;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={isMenuCollapsed}
        onCollapse={setCollapsedMenu}
        width={300}
      >
        <Menu theme="dark" defaultSelectedKeys={pathParts} mode="inline">
          {Object.entries(routesOnlyForAuthedUsers).map(
            ([path, { menuIcon, menuTitle }]) => (
              <Menu.Item key={path} icon={menuIcon}>
                <Link to={`/adminPanel/${path}`}>{menuTitle}</Link>
              </Menu.Item>
            ),
          )}

          <Menu.Item key="empty" />

          <Menu.Item
            key="logout"
            onClick={() => updateAuthContext({ isAuthed: false })}
          >
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }}>
          <PageHeader
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
        <Content style={{ margin: '0 16px' }}>
          <div style={{ background: '#fff', padding: 24, minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Made with ❤️ by nikelborm
        </Footer>
      </Layout>
    </Layout>
  );
}

type AdminPanelWrapperProps = ReturnType<typeof useAuthedUser> &
  ReturnType<typeof usePath>;
