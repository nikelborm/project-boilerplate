import { Navigate, Route, Routes } from 'react-router-dom';
import { useSession, usePath } from 'hooks';
import {
  AdminPanelWrapper,
  AuthWrapper,
  renderAuthFallbackRoute,
} from 'components';
import { canUserUseThisRoute } from 'utils';
import {
  routesOnlyForAuthedUsers,
  routesOnlyForNotAuthedUsers,
  publicRoutes,
  publicFallbackRoute,
  getAuthedFallbackRoute,
} from './routes';

function App() {
  const session = useSession();
  const usePathData = usePath();
  return (
    <Routes>
      {Object.entries(publicRoutes).map(([path, { Component }]) => (
        <Route key={path} path={path} element={<Component />} />
      ))}

      <Route
        path="/auth"
        element={<AuthWrapper session={session} {...usePathData} />}
      >
        {Object.entries(routesOnlyForNotAuthedUsers).map(
          ([path, { Component }]) => (
            <Route path={path} key={path} element={<Component />} />
          ),
        )}
        {renderAuthFallbackRoute(session)}
      </Route>

      <Route
        path="/adminPanel"
        element={<AdminPanelWrapper session={session} {...usePathData} />}
      >
        {Object.entries(routesOnlyForAuthedUsers).map(
          ([path, { Component, allowedForScopeTypes }]) => (
            <Route
              path={path}
              key={path}
              element={
                /* eslint-disable prettier/prettier */
                session.isAuthed && (
                  canUserUseThisRoute(session, allowedForScopeTypes)
                    ? <Component />
                    : <Navigate to={getAuthedFallbackRoute(session)} />
                )
                /* eslint-enable prettier/prettier */
              }
            />
          ),
        )}
        {renderAuthFallbackRoute(session)}
      </Route>

      <Route path="*" element={<Navigate to={publicFallbackRoute} />} />
    </Routes>
  );
}

export default App;
