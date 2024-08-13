import { IUserQueryOptions } from '@libs/api/endpoints';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import api from '../../../libs/api';
import { IAccount, IFormError, IRegisterAccount, IUser, IUserDetailsResponse } from '../../../libs/api/types';
import { useAppStore } from '../../stores/app.store';
import { AucctusQueryKeys } from './query-keys';

const INITIAL_USER_DETAILS: Partial<IUserDetailsResponse> = {
  user: undefined,
  account: undefined,
};

export const useUserDetails = (enabled: boolean) => {
  const { setUser, setAccount } = useAppStore();

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

export const useAllUsers = (options?: IUserQueryOptions) => {
  const query = useQuery({
    queryKey: options
      ? [AucctusQueryKeys.allUsers, options.email, options.firstName, options.lastName, options.search]
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

export const useDashboard = () => {
  return useQuery({
    queryKey: [AucctusQueryKeys.dashboard],
    queryFn: async () => await api.account.getDashboard(),
    cacheTime: Infinity,
    staleTime: 1000 * 60, // 1 minute
    refetchOnMount: false,
    retry: false,
    enabled: true,
  });
};

export const useRegisterAccount = () => {
  const queryClient = useQueryClient();
  return useMutation<IAccount, AxiosError<IFormError>, IRegisterAccount, unknown>({
    mutationFn: async (details) => await api.account.createAccount(details),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.userDetails] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<IUserDetailsResponse, AxiosError<IFormError>, Partial<IUser>, unknown>({
    mutationFn: async (userObj) => await api.account.updateUser(userObj),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.userDetails] });
    },
  });
};
