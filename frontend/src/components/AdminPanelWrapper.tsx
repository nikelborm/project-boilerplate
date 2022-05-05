import { useState } from 'react';
import { Link, Outlet, Navigate } from 'react-router-dom';
import { Layout, Menu, PageHeader } from 'antd';
import { useAuthContextUpdater, usePath } from 'hooks';
import { ISession, RoutesEnum } from 'types';
import { notAuthedFallbackRoute, routesOnlyForAuthedUsers } from 'routes';
import { canUserUseThisRoute } from 'utils';
import { ItemType } from 'antd/lib/menu/hooks/useItems';

const { Header, Content, Footer, Sider } = Layout;

export function AdminPanelWrapper({
  session,
  deepestPathPart,
  pathParts,
}: AdminPanelWrapperProps) {
  const [isMenuCollapsed, setCollapsedMenu] = useState(false);
  const { updateAuthContext } = useAuthContextUpdater();

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
                ([path, { menuIcon, menuTitle, allowedForScopeTypes }]) =>
                  canUserUseThisRoute(
                    session.authInfo,
                    allowedForScopeTypes,
                  ) && {
                    label: <Link to={`/adminPanel/${path}`}>{menuTitle}</Link>,
                    key: path,
                    icon: menuIcon,
                  },
              )
              .filter((isNotNullable) => isNotNullable) as ItemType[]),
            {
              key: 'empty',
              disabled: true,
            },
            {
              label: 'Logout',
              key: 'logout',
              onClick: () => updateAuthContext({ isAuthed: false }),
            },
          ]}
        />
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

type AdminPanelWrapperProps = { session: ISession } & ReturnType<
  typeof usePath
>;
