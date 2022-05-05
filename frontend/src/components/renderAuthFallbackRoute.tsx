import { Navigate, Route } from 'react-router-dom';
import { authedFallbackRoute, notAuthedFallbackRoute } from 'routes';

export function renderAuthFallbackRoute({ isAuthed }: AuthFallbackRouteProps) {
  return (
    <Route
      path="*"
      element={
        <Navigate
          to={
            isAuthed
              ? `/adminPanel/${authedFallbackRoute}`
              : `/auth/${notAuthedFallbackRoute}`
          }
        />
      }
    />
  );
}

interface AuthFallbackRouteProps {
  isAuthed: boolean;
}
