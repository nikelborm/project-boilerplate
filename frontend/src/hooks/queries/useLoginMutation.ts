import { useMutation } from 'react-query';
import { ITokenPair } from 'types';
import { customFetch, useTokenPairUpdater } from 'utils';

export function useLoginMutation() {
  const { updateTokenPair } = useTokenPairUpdater();
  const { mutate, isLoading, isError, isSuccess } = useMutation(
    (credentials: { email: string; password: string }) =>
      customFetch<ITokenPair>('auth/local/login', {
        method: 'POST',
        needsAccessToken: false,
        body: credentials,
      }).then(updateTokenPair),
  );
  return { sendLoginQuery: mutate, isLoading, isError, isSuccess };
}
