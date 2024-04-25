import { useMutation, useQuery, useQueryClient } from 'react-query';
import api from '../../../libs/api';
import { AucctusQueryKeys } from './query-keys';
import { IAccount, IFormError, IRegisterAccount, IUser, IUserDetailsResponse } from '../../../libs/api/types';
import { AxiosError } from 'axios';

export const useUserDetails = () => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.userDetails],
    queryFn: async () => await api.account.getUser(),
    cacheTime: 1000 * 60 * 60,
    staleTime: 1000 * 60 * 60,
  });

  const { data } = query;
  const { user, account } = data || { user: undefined, account: undefined };
  return { ...query, user, account };
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

export const useDashboard = () => {
  return useQuery({
    queryKey: [AucctusQueryKeys.dashboard],
    queryFn: async () => await api.account.getDashboard(),
    cacheTime: 1000 * 60 * 60,
    staleTime: 1000 * 60 * 15,
  });
};
