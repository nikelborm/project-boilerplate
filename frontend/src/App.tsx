import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthedUser, usePath } from 'hooks';
import {
  AdminPanelWrapper,
  AuthWrapper,
  renderAuthFallbackRoute,
} from 'components';
import {
  routesOnlyForAuthedUsers,
  routesOnlyForNotAuthedUsers,
  publicRoutes,
  publicFallbackRoute,
} from './routes';

function App() {
  const { isAuthed, authInfo } = useAuthedUser();
  const usePathData = usePath();
  return (
    <Routes>
      {Object.entries(publicRoutes).map(([path, { Component }]) => (
        <Route key={path} path={path} element={<Component />} />
      ))}

      <Route
        path="/auth"
        element={
          <AuthWrapper
            isAuthed={isAuthed}
            authInfo={authInfo}
            {...usePathData}
          />
        }
      >
        {Object.entries(routesOnlyForNotAuthedUsers).map(
          ([path, { Component }]) => (
            <Route path={path} key={path} element={<Component />} />
          ),
        )}
        {renderAuthFallbackRoute({ isAuthed })}
      </Route>

      <Route
        path="/adminPanel"
        element={
          <AdminPanelWrapper
            isAuthed={isAuthed}
            authInfo={authInfo}
            {...usePathData}
          />
        }
      >
        {Object.entries(routesOnlyForAuthedUsers).map(
          // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
          ([path, { Component, allowedForScopeTypes }]) => (
            <Route path={path} key={path} element={<Component />} />
          ),
        )}
        {renderAuthFallbackRoute({ isAuthed })}
      </Route>

      <Route path="*" element={<Navigate to={publicFallbackRoute} />} />
    </Routes>
  );
}

export default App;
