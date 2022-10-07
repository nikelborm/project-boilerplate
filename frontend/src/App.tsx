import { Navigate, Route, Routes } from 'react-router-dom';
import { useSession, usePath } from 'hooks';
import {
  AccountPagesWrapper,
  AuthPagesWrapper,
  renderAuthFallbackRoute,
} from 'components';
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
        element={<AuthPagesWrapper session={session} {...usePathData} />}
      >
        {Object.entries(routesOnlyForNotAuthedUsers).map(
          ([path, { Component }]) => (
            <Route path={path} key={path} element={<Component />} />
          ),
        )}
        {renderAuthFallbackRoute(session)}
      </Route>

      <Route
        path="/account"
        element={<AccountPagesWrapper session={session} {...usePathData} />}
      >
        {Object.entries(routesOnlyForAuthedUsers).map(
          ([path, { Component, canUserOpenThisRoute }]) => (
            <Route
              path={path}
              key={path}
              element={
                /* eslint-disable prettier/prettier */
                session.isAuthed && (
                  canUserOpenThisRoute(session)
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
