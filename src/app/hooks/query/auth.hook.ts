import useAppStore from '@stores/store';
import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../../libs/api';
import {
  IAuthSuccessResponse,
  IMessageResponse,
  IRegisterUser,
  IServerErrorMessage,
  ITokenResponse,
  IUpdateForgottenPasswordRequest,
} from '../../../libs/api/types';
import { AppPath } from '../../../routes/routes';
import { AucctusQueryKeys } from './query-keys';

// Define a custom error class
class NoRefreshTokenError extends Error {
  constructor() {
    super('No refresh token available');
    this.name = 'NoRefreshTokenError';
  }
}

export const useSignUp = () => {
  const navigate = useNavigate();

  return useMutation<
    IMessageResponse,
    AxiosError<IServerErrorMessage>,
    IRegisterUser,
    unknown
  >({
    mutationFn: async (details) =>
      await api.auth.signup(
        details.firstName,
        details.lastName,
        details.email,
        details.password,
        details.confirmPassword,
      ),
    onSuccess: () => {
      navigate(AppPath.ConfirmEmail);
    },
  });
};

export const useRequestPasswordReset = () => {
  return useMutation<
    IMessageResponse,
    AxiosError<IServerErrorMessage>,
    string,
    unknown
  >({
    mutationFn: async (email: string) =>
      await api.auth.requestPasswordReset(email),
  });
};

export const usePasswordReset = () => {
  return useMutation<
    IMessageResponse,
    AxiosError<IServerErrorMessage>,
    IUpdateForgottenPasswordRequest,
    unknown
  >({
    mutationFn: async (credentials) =>
      await api.auth.resetPassword(
        credentials.password,
        credentials.confirmPassword,
        credentials.token,
      ),
  });
};

export const useConfirmEmail = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IMessageResponse,
    AxiosError<IServerErrorMessage>,
    string,
    unknown
  >({
    mutationFn: async (token: string) => await api.auth.confirmEmail(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AucctusQueryKeys.userDetails });
    },
  });
};

export const useRefresh = () => {
  const clear = useAppStore((state) => state.auth.clearTokens);
  const refresh = useAppStore((state) => state.auth.refresh);
  const storeTokens = useAppStore((state) => state.auth.storeTokens);

  return useMutation<
    ITokenResponse,
    AxiosError<IServerErrorMessage>,
    void,
    unknown
  >({
    mutationFn: async () => {
      if (!refresh) {
        throw new NoRefreshTokenError();
      }
      return await api.auth.refreshToken(refresh);
    },
    onSuccess: async (response) => {
      await storeTokens(response.access, response.refresh);
    },
    onError: (error) => {
      if (!(error instanceof NoRefreshTokenError)) {
        // eslint-disable-next-line no-console
        console.error('Error refreshing token (App)', error);

        // Remove tokens if refresh fails
        clear();
      }
    },
  });
};

export const useLogout = () => {
  const logout = useAppStore((state) => state.auth.logout);
  const access = useAppStore((state) => state.auth.access);
  const refresh = useAppStore((state) => state.auth.refresh);

  const queryClient = useQueryClient();
  return useMutation<
    IMessageResponse,
    AxiosError<IServerErrorMessage>,
    void,
    unknown
  >({
    mutationFn: async () => await api.auth.logout(access, refresh),
    onSettled: () => {
      // Clear tokens on logout
      logout();
    },
    onSuccess: () => {
      // Clear cache on logout
      queryClient.removeQueries();
      queryClient.invalidateQueries();
    },
  });
};

export const useLogin = () => {
  const navigate = useNavigate();
  const storeTokens = useAppStore((state) => state.auth.storeTokens);
  const setUser = useAppStore((state) => state.auth.setUser);
  const setInitialized = useAppStore((state) => state.auth.setInitialized);
  const setAccount = useAppStore((state) => state.auth.setAccount);

  return useMutation<
    IAuthSuccessResponse,
    AxiosError<IServerErrorMessage>,
    { email: string; password: string },
    unknown
  >({
    mutationFn: async (credentials) =>
      await api.auth.login(credentials.email, credentials.password),
    onSuccess: async (response) => {
      await storeTokens(response.access, response.refresh);
      setUser(response.user);
      setAccount(response.account);
      setInitialized(true);
      navigate(AppPath.Home, { replace: true });
    },
  });
};
