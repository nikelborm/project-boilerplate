import { usePath } from 'hooks';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuthedFallbackRoute } from 'routes';
import { ISession } from 'types';

export function AuthWrapper({ session }: AuthWrapperProps) {
  if (session.isAuthed)
    return (
      <Navigate
        to={`/adminPanel/${getAuthedFallbackRoute(session.authInfo)}`}
      />
    );

  return (
    <div>
      auth wrapper{' '}
      <div>
        <Outlet />
      </div>
    </div>
  );
}

type AuthWrapperProps = { session: ISession } & ReturnType<typeof usePath>;
