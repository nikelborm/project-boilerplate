import styled from 'styled-components';
import { useSocket } from 'utils';

export function Profile() {
  useSocket({
    namespace: '/test',
    handlers: {},
  });
  return <MainWrapper>as</MainWrapper>;
}

const MainWrapper = styled.div`
  height: 100%;
  overflow-y: hidden;
`;
