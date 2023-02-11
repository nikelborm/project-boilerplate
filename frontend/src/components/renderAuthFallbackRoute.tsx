import { Navigate, Route } from 'react-router-dom';
import type { ISession } from 'types';
import { getAuthedFallbackRoute, notAuthedFallbackRoute } from '../routes';

export function renderAuthFallbackRoute(session: ISession) {
  return ['*', ''].map((path) => (
    <Route
      path={path}
      key={path}
      element={
        <Navigate
          to={
            session.isAuthed
              ? `/account/${getAuthedFallbackRoute(session)}`
              : `/auth/${notAuthedFallbackRoute}`
          }
        />
      }
    />
  ));
}
