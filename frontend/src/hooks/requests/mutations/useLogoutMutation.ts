import { useMutation } from 'react-query';
import { customFetch, useTokenPairUpdater } from 'tools';

export function useLogoutMutation() {
  const { updateTokenPair } = useTokenPairUpdater();
  const { mutate, isLoading, isError, isSuccess } = useMutation(() =>
    customFetch('auth/logout', {
      method: 'POST',
      needsAccessToken: true,
      needsJsonResponseBodyParsing: false,
    }).then(() => updateTokenPair(null)),
  );
  return { sendLogoutQuery: mutate, isLoading, isError, isSuccess };
}
