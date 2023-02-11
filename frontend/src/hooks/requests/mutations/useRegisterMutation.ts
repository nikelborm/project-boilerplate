import { useMutation } from 'react-query';
import { RegisterUserResponseDTO, CreateUserDTO } from 'types/shared';
import { customFetch } from 'utils';

export function useRegistrationMutation() {
  const { mutate, isLoading, isError, isSuccess, data } = useMutation(
    ({ confirm, ...user }: CreateUserDTO & { confirm: string }) =>
      user.password === confirm
        ? customFetch<RegisterUserResponseDTO>('auth/local/register', {
            method: 'POST',
            needsAccessToken: false,
            body: user,
          })
        : Promise.reject(new Error('Passwords does not match!')),
  );
  return { sendRegistrationQuery: mutate, isLoading, isError, isSuccess, data };
}
