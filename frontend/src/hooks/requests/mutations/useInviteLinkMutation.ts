import {
  useMutation,
  // useQueryClient
} from 'react-query';
import {
  customFetch,
  // invalidatePassthrough,
  // useSession,
  useTokenPairUpdater,
} from 'tools';
import { UseInviteLinkDTO } from 'types/shared';
import { message } from 'antd';

export function useInviteLinkMutation(onError: (err: any) => void) {
  // const queryClient = useQueryClient();
  const { requestTokenPairRefreshing } = useTokenPairUpdater();
  const { mutate, isLoading, isError, isSuccess } = useMutation(
    (inviteLinkPayload: UseInviteLinkDTO) =>
      customFetch('accounts/useInvite', {
        needsJsonResponseBodyParsing: false,
        requestDTOclass: UseInviteLinkDTO,
        method: 'POST',
        body: inviteLinkPayload,
      })
        // .then(invalidatePassthrough(queryClient, 'something'))
        .then(requestTokenPairRefreshing),
    {
      onSuccess: () => void message.success('You were successfully invited'),
      onError,
    },
  );
  return { sendJoinToGroupQuery: mutate, isLoading, isError, isSuccess };
}
