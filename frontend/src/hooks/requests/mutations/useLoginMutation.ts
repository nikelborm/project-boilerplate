import { useMutation } from 'react-query';
import { customFetch, useTokenPairUpdater } from '@/tools';
import { AuthTokenPairDTO, LoginUserRequestDTO } from '@/types/shared';

export function useLoginMutation() {
  const { updateTokenPair } = useTokenPairUpdater();
  const { mutate, isLoading, isError, isSuccess } = useMutation(
    (credentials: LoginUserRequestDTO) =>
      customFetch('auth/local/login', {
        method: 'POST',
        needsAccessToken: false,
        needsJsonResponseBodyParsing: true,
        requestDTOclass: LoginUserRequestDTO,
        responseDTOClass: AuthTokenPairDTO,
        body: credentials,
      }).then(updateTokenPair),
  );
  return { sendLoginQuery: mutate, isLoading, isError, isSuccess };
}
