import { useQuery } from 'react-query';
import { customFetch } from 'utils';
import { FindManyUsersResponseDTO } from 'backendTypes';

export function useAllUsersQuery() {
  const { isLoading, isError, isSuccess, data } = useQuery('useAllUsers', () =>
    customFetch<FindManyUsersResponseDTO>('user/all', {
      method: 'GET',
      needsAccessToken: true,
    }),
  );
  return {
    isLoading,
    isError,
    isSuccess,
    users: data?.users,
  };
}
