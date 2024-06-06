import { useMutation, useQuery, useQueryClient } from 'react-query';
import api from '../../../libs/api';
import { AucctusQueryKeys } from './query-keys';
import { IAccount, IFormError, IRegisterAccount, IUser, IUserDetailsResponse } from '../../../libs/api/types';
import { AxiosError } from 'axios';
import { useApp } from '../../context/AppContextProvider';
import { useLocalStorage, useSessionStorage } from '../utility.hook';

const INITIAL_USER_DETAILS: Partial<IUserDetailsResponse> = {
  user: undefined,
  account: undefined,
};

// TODO: review this hooks enabled logic
export const useUserDetails = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [initialized, _] = useSessionStorage<boolean>('initialized');
  const [userDetails, setUserDetails] = useLocalStorage<Partial<IUserDetailsResponse>>('user');
  const { isAuthenticated } = useApp();

  const query = useQuery({
    queryKey: [AucctusQueryKeys.userDetails],
    queryFn: async () => await api.account.getUser(),
    cacheTime: 1000 * 60 * 60,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,

    retry: false,
    enabled: !!initialized && isAuthenticated,
    placeholderData: userDetails || INITIAL_USER_DETAILS,
    onSuccess: (data) => {
      setUserDetails(data);
    },
  });

  const { data } = query;
  const { user, account } = data || INITIAL_USER_DETAILS;

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
  const { isAuthenticated } = useApp();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userDetails, _] = useLocalStorage<Partial<IUserDetailsResponse>>('user');
  const { account } = userDetails || INITIAL_USER_DETAILS;

  return useQuery({
    queryKey: [AucctusQueryKeys.dashboard],
    queryFn: async () => await api.account.getDashboard(),
    cacheTime: 1000 * 60 * 60,
    staleTime: 1000 * 60 * 15,
    retry: false,
    enabled: !!account && isAuthenticated,
  });
};
