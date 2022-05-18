import { Navigate, Outlet } from 'react-router-dom';
import { usePath } from 'hooks';
import { ISession } from 'types';
import { getAuthedFallbackRoute } from '../routes';

export function AuthWrapper({ session }: AuthWrapperProps) {
  if (session.isAuthed)
    return <Navigate to={`/adminPanel/${getAuthedFallbackRoute(session)}`} />;

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
