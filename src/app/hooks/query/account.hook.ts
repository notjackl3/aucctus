import { useAuthStore } from '@stores/auth.store';
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
import { useLogout } from './auth.hook';
import { AucctusQueryKeys } from './query-keys';

const INITIAL_USER_DETAILS: Partial<IUserDetailsResponse> = {
  user: undefined,
  account: undefined,
};

export const useUserDetails = (enabled: boolean) => {
  const { setUser, setAccount } = useAuthStore();

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
  const { mutate: logout } = useLogout();

  const query = useQuery({
    queryKey: [AucctusQueryKeys.userDetails],
    queryFn: async () => await api.account.getUser(),
    onError: (error: unknown) => {
      // Check if the error is an AxiosError with an HTTP response
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if ([401, 403, 419].includes(status || 0)) {
          // Log the user out if we have an unauthenticated error
          logout();
        }
      }
    },
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
    refetchOnMount: false,
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
  const queryClient = useQueryClient();
  return useMutation<
    IAccount,
    AxiosError<IFormError>,
    IRegisterAccount,
    unknown
  >({
    mutationFn: async (details) => await api.account.createAccount(details),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.userDetails],
      });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IUserDetailsResponse,
    AxiosError<IFormError>,
    Partial<IUser>,
    unknown
  >({
    mutationFn: async (userObj) => await api.account.updateUser(userObj),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.userDetails],
      });
    },
  });
};
