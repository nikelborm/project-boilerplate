import {
  useMutation,
  // useQueryClient
} from 'react-query';
import {
  customFetch,
  // invalidatePassthrough,
  // useSession,
  useTokenPairUpdater,
  validate,
} from 'utils';
import { UseInviteLinkDTO, EmptyResponseDTO } from 'backendTypes';
import { message } from 'antd';

export function useInviteLinkMutation(onError: (err: any) => void) {
  // const queryClient = useQueryClient();
  const { requestTokenPairRefreshing } = useTokenPairUpdater();
  const { mutate, isLoading, isError, isSuccess } = useMutation(
    (inviteLinkPayload: UseInviteLinkDTO) =>
      validate(inviteLinkPayload, UseInviteLinkDTO).length
        ? Promise.reject(new Error('Validation error'))
        : customFetch<EmptyResponseDTO>('accounts/useInvite', {
            method: 'POST',
            body: inviteLinkPayload,
          })
            // .then(invalidatePassthrough(queryClient, 'something'))
            .then(requestTokenPairRefreshing),
    {
      onSuccess: () => void message.success('You were sucessfully invited'),
      onError,
    },
  );
  return { sendJoinToGroupQuery: mutate, isLoading, isError, isSuccess };
}
