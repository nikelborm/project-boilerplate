/* eslint-disable prettier/prettier */
import { useMutation } from 'react-query';
import { TokenPairDTO, CreateUserDTO } from 'backendTypes';
import { customFetch, useTokenPairUpdater } from 'utils';

export function useRegistrationMutation() {
  const { updateTokenPair } = useTokenPairUpdater();
  const { mutate, isLoading, isError, isSuccess } = useMutation(
    ({ confirm, ...user }: CreateUserDTO & { confirm: string }) =>
      user.password === confirm
        ? customFetch<TokenPairDTO>('auth/local/register', {
          method: 'POST',
          needsAccessToken: false,
          body: user,
        }).then(updateTokenPair)
        : Promise.reject(new Error('Passwords does not match!')),
  );
  return { sendRegistrationQuery: mutate, isLoading, isError, isSuccess };
}
