import { useClerk, useUser as useClerkUser } from '@clerk/clerk-react';
import { toast } from '@components';
import useStore, { resetAllStoreData } from '@stores/store';
import { AxiosError, isAxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import api from '../../../libs/api';
import {
  IAccount,
  IFormError,
  IRegisterAccount,
  IUser,
  IUserDetailsResponse,
  IUserQueryOptions,
} from '../../../libs/api/types';
import { AucctusQueryKeys } from './query-keys';
import telemetry from '@libs/telemetry';

/**
 * Helper function to update Clerk user profile with firstName and/or lastName
 */
const updateClerkUserProfile = async (
  clerkUser: any,
  userObj: Partial<IUser>,
): Promise<void> => {
  if (!clerkUser || (!userObj.firstName && !userObj.lastName)) {
    return;
  }

  try {
    await clerkUser.update({
      firstName: userObj.firstName || clerkUser.firstName,
      lastName: userObj.lastName || clerkUser.lastName,
    });
  } catch (clerkError) {
    telemetry.error('Failed to update Clerk user profile:', clerkError);
  }
};

const INITIAL_USER_DETAILS: Partial<IUserDetailsResponse> = {
  user: undefined,
  account: undefined,
};

export const useUserDetails = (enabled: boolean) => {
  const setUser = useStore((state) => state.auth.setUser);
  const setAccount = useStore((state) => state.auth.setAccount);

  const query = useQuery({
    queryKey: [AucctusQueryKeys.userDetails],
    queryFn: async () => await api.account.getUser(),
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
    refetchOnMount: false,
    enabled: enabled,
    onSuccess: (data) => {
      setUser(data.user);
      setAccount(data.account);
    },
  });

  const { data } = query;
  const { user, account } = data || INITIAL_USER_DETAILS;
  const getUserDetails = query.refetch;

  return { ...query, getUserDetails, user, account };
};

export const useUser = () => {
  const { setUser, setAccount } = useStore((state) => state.auth);
  const { signOut } = useClerk();

  const query = useQuery({
    queryKey: [AucctusQueryKeys.userDetails],
    queryFn: async () => await api.account.getUser(),
    onSuccess: (data) => {
      setUser(data.user);
      setAccount(data.account);
    },
    onError: (error: unknown) => {
      // Check if the error is an AxiosError with an HTTP response
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if ([401, 403, 419].includes(status || 0)) {
          // Log the user out if we have an unauthenticated error
          signOut().then(() => {
            resetAllStoreData();
          });
        }
      }
    },
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
    refetchOnMount: false,
    enabled: false,
  });

  return { ...query, user: query.data?.user, account: query.data?.account };
};

export const useAllUsers = (options?: IUserQueryOptions) => {
  const query = useQuery({
    queryKey: options
      ? [
          AucctusQueryKeys.allUsers,
          options.email,
          options.firstName,
          options.lastName,
          options.search,
        ]
      : [AucctusQueryKeys.allUsers],
    queryFn: async () => await api.account.getAllUser(options),
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
    refetchOnMount: false,
  });

  const { data } = query;
  return { ...query, users: data || [] };
};

export const useDashboard = (enabled: boolean) => {
  return useQuery({
    queryKey: [AucctusQueryKeys.dashboard],
    queryFn: async () => await api.account.getDashboard(),
    cacheTime: Infinity,
    staleTime: 1000 * 60, // 1 minute
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: enabled,
  });
};

export const useRegisterAccount = () => {
  const setAccount = useStore((state) => state.auth.setAccount);
  const queryClient = useQueryClient();
  return useMutation<
    IAccount,
    AxiosError<IFormError>,
    IRegisterAccount,
    unknown
  >({
    mutationFn: async (details) => await api.account.createAccount(details),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.userDetails],
      });
      setAccount(data);
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  const setAccount = useStore((state) => state.auth.setAccount);

  return useMutation<IAccount, AxiosError<IFormError>, Partial<IAccount>>({
    mutationFn: async (payload) => await api.account.updateAccount(payload),
    onSuccess: (data) => {
      setAccount(data);
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.userDetails],
      });
      toast.success(
        'Account Updated',
        'Your account has been updated successfully',
      );
    },
    onError: () => {
      toast.error('Update Failed', 'Failed to update account details');
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const setUser = useStore((state) => state.auth.setUser);
  const setAccount = useStore((state) => state.auth.setAccount);
  const { user: clerkUser } = useClerkUser();

  return useMutation<
    IUserDetailsResponse,
    AxiosError<IFormError>,
    Partial<IUser>,
    unknown
  >({
    mutationFn: async (userObj) => {
      // Update backend user
      const result = await api.account.updateUser(userObj);

      // Update Clerk user profile if firstName or lastName are being updated
      await updateClerkUserProfile(clerkUser, userObj);

      return result;
    },
    onSuccess: (data) => {
      setUser(data.user);
      setAccount(data.account);
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.userDetails],
      });
      toast.success(
        'Profile Updated',
        'Your user profile has been updated successfully',
      );
    },
  });
};
