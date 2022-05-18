import { QueryClient, QueryKey } from 'react-query';

export function invalidatePassthrough(
  queryClient: QueryClient,
  queryKeys: QueryKey | QueryKey[],
) {
  return (data: any) => {
    (typeof queryKeys === 'string' ? [queryKeys] : queryKeys).forEach(
      (queryKey) => {
        // @ts-expect-error TODO
        queryClient.invalidateQueries(queryKey);
      },
    );
    return data;
  };
}
