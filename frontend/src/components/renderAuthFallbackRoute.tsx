import { Navigate, Route } from 'react-router-dom';
import { getAuthedFallbackRoute, notAuthedFallbackRoute } from 'routes';
import type { ISession } from 'types';

export function renderAuthFallbackRoute(session: ISession) {
  return ['*', ''].map((path) => (
    <Route
      path={path}
      key={path}
      element={
        <Navigate
          to={
            session.isAuthed
              ? `/adminPanel/${getAuthedFallbackRoute(session.authInfo)}`
              : `/auth/${notAuthedFallbackRoute}`
          }
        />
      }
    />
  ));
}
