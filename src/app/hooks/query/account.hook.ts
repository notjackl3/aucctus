import { useMutation, useQuery, useQueryClient } from 'react-query';
import api from '../../../libs/api';
import { AucctusQueryKeys } from './query-keys';
import { IAccount, IFormError, IRegisterAccount, IUser, IUserDetailsResponse } from '../../../libs/api/types';
import { AxiosError, isAxiosError } from 'axios';
import { useApp } from '../../context/AppContextProvider';
import { useAppStore } from '../../stores/app.store';
import { toast } from 'react-toastify';

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

      if (data.account) {
        setAccount(data.account);
      }
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 500) {
          toast.error('Something went wrong. Please try again later.');
        }
      }
    },
  });

  const { data } = query;
  const { user, account } = data || INITIAL_USER_DETAILS;
  const getUserDetails = query.refetch;

  return { ...query, getUserDetails, user, account };
};

export const useDashboard = () => {
  const { isAuthenticated } = useApp();
  const { account } = useAppStore();

  return useQuery({
    queryKey: [AucctusQueryKeys.dashboard],
    queryFn: async () => await api.account.getDashboard(),
    cacheTime: Infinity,
    refetchOnMount: false,
    retry: false,
    enabled: !!account && isAuthenticated,
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
