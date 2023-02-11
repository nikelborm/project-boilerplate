import { QueryClient, QueryKey } from 'react-query';

export function invalidatePassthrough(
  queryClient: QueryClient,
  queryKeys: string | QueryKey[],
) {
  return (data: any) => {
    (typeof queryKeys === 'string'
      ? [queryKeys]
      : (queryKeys as string[])
    ).forEach((queryKey) => {
      void queryClient.invalidateQueries(queryKey);
    });
    return data;
  };
}
