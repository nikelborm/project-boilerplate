import { useMutation } from 'react-query';
import { RegisterUserResponseDTO, CreateUserRequestDTO } from 'types/shared';
import { customFetch } from 'tools';

export function useRegistrationMutation() {
  const { mutate, isLoading, isError, isSuccess, data } = useMutation(
    ({ confirm, ...user }: CreateUserRequestDTO & { confirm: string }) =>
      user.password === confirm
        ? customFetch('auth/local/register', {
            method: 'POST',
            needsAccessToken: false,
            needsJsonResponseBodyParsing: true,
            requestDTOclass: CreateUserRequestDTO,
            responseDTOclass: RegisterUserResponseDTO,
            body: user,
          })
        : Promise.reject(new Error('Passwords does not match!')),
  );
  return { sendRegistrationQuery: mutate, isLoading, isError, isSuccess, data };
}
