import { useMutation } from 'react-query';
import { ITokenPair } from 'types';
import { customFetch, useTokenPairUpdater } from 'utils';

export function useRegistrationMutation() {
  const { updateTokenPair } = useTokenPairUpdater();
  const { mutate, isLoading, isError, isSuccess } = useMutation(
    (credentials: { email: string; password: string }) =>
      customFetch<ITokenPair>('auth/local/register', {
        method: 'POST',
        needsToken: false,
        body: credentials,
      }).then(updateTokenPair),
  );
  return { sendRegistrationQuery: mutate, isLoading, isError, isSuccess };
}
