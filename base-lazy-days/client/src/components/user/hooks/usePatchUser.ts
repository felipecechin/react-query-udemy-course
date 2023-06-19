import { useCustomToast } from 'components/app/hooks/useCustomToast';
import jsonpatch from 'fast-json-patch';
import { UseMutateFunction, useMutation, useQueryClient } from 'react-query';
import { queryKeys } from 'react-query/constants';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { useUser } from './useUser';

// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );
  return data.user;
}

export function usePatchUser(): UseMutateFunction<
  User,
  unknown,
  User,
  unknown
> {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();

  const queryClient = useQueryClient();

  const { mutate: patchUser } = useMutation(
    (newUserData: User) => patchUserOnServer(newUserData, user),
    {
      onMutate: async (newData: User | null) => {
        // cancel any outgoing queries for user data, so old server data
        // doesn't overwrite our optimistic update
        queryClient.cancelQueries(queryKeys.user);

        // snapshot the previous value
        const previousUserData: User = queryClient.getQueryData(queryKeys.user);

        // optimistically update the user data to the new value
        updateUser(newData);

        // return context object with snapshotted data
        return { previousUserData };
      },
      onError: (error, newData, previousUserDataContext) => {
        // rollback cache to saved value
        if (previousUserDataContext.previousUserData) {
          updateUser(previousUserDataContext.previousUserData);
          toast({
            title: 'Error updating user',
            status: 'warning',
          });
        }
      },
      onSuccess: (newUser: User | null) => {
        if (newUser) {
          toast({
            title: 'User updated',
            status: 'success',
          });
        }
      },
      onSettled: () => {
        // re-fetch user data
        queryClient.invalidateQueries(queryKeys.user);
      },
    },
  );

  return patchUser;
}
