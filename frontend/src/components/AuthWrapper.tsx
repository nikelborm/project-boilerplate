import { useAuthedUser, usePath } from 'hooks';
import { Navigate, Outlet } from 'react-router-dom';
import { authedFallbackRoute, notAuthedFallbackRoute } from 'routes';

export function AuthWrapper({ isAuthed, deepestPathPart }: AuthWrapperProps) {
  if (deepestPathPart === 'auth')
    return <Navigate to={notAuthedFallbackRoute} />;

  if (isAuthed) return <Navigate to={`/adminPanel/${authedFallbackRoute}`} />;

  return (
    <div>
      auth wrapper{' '}
      <div>
        <Outlet />
      </div>
    </div>
  );
}

type AuthWrapperProps = ReturnType<typeof useAuthedUser> &
  ReturnType<typeof usePath>;
