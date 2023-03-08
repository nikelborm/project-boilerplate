import { useQuery } from 'react-query';
import { customFetch } from 'tools';
import { FindManyUsersResponseDTO } from 'types/shared';

export function useAllUsersQuery() {
  const { isLoading, isError, isSuccess, data } = useQuery('useAllUsers', () =>
    customFetch('user/all', {
      method: 'GET',
      needsJsonResponseBodyParsing: true,
      responseDTOclass: FindManyUsersResponseDTO,
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
