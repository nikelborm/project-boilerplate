import { useMutation } from 'react-query';
import { customFetch, useTokenPairUpdater } from 'utils';
import { AuthTokenPairDTO } from 'backendTypes';

export function useLoginMutation() {
  const { updateTokenPair } = useTokenPairUpdater();
  const { mutate, isLoading, isError, isSuccess } = useMutation(
    (credentials: { email: string; password: string }) =>
      customFetch<AuthTokenPairDTO>('auth/local/login', {
        method: 'POST',
        needsAccessToken: false,
        body: credentials,
      }).then(updateTokenPair),
  );
  return { sendLoginQuery: mutate, isLoading, isError, isSuccess };
}
