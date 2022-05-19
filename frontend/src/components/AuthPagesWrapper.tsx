import { Navigate, Outlet } from 'react-router-dom';
import { usePath } from 'hooks';
import { ISession } from 'types';
import styled from 'styled-components';
import { getAuthedFallbackRoute } from '../routes';

export function AuthPagesWrapper({ session }: AuthWrapperProps) {
  if (session.isAuthed)
    return <Navigate to={`/account/${getAuthedFallbackRoute(session)}`} />;

  return (
    <CenteredContentWrapper>
      <CenteredContent>
        <Outlet />
      </CenteredContent>
    </CenteredContentWrapper>
  );
}

const CenteredContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  overflow-x: hidden;
  display: grid;
  place-content: center center;
`;

const CenteredContent = styled.div`
  width: 300px;
  height: 500px;
`;

type AuthWrapperProps = { session: ISession } & ReturnType<typeof usePath>;
