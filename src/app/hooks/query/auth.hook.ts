import { useAppStore } from '@stores/app.store';
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
import { useTokenStore } from '../../stores/token.store';
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
  const { clearTokens: clear, refresh, storeTokens } = useTokenStore();

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
    onSuccess: (response) => {
      storeTokens(response.access, response.refresh);
    },
    onError: (error) => {
      if (!(error instanceof NoRefreshTokenError)) {
        console.error('Error refreshing token (App)', error);

        // Remove tokens if refresh fails
        clear();
      }
    },
  });
};

export const useLogout = () => {
  const { clearTokens: clear, access } = useTokenStore();

  return useMutation<
    IMessageResponse,
    AxiosError<IServerErrorMessage>,
    void,
    unknown
  >({
    mutationFn: async () => await api.auth.logout(access),
    onSettled: () => {
      // Clear tokens on logout
      clear();
    },
  });
};

export const useLogin = () => {
  const navigate = useNavigate();
  const { storeTokens } = useTokenStore();
  const { setUser } = useAppStore();

  return useMutation<
    IAuthSuccessResponse,
    AxiosError<IServerErrorMessage>,
    { email: string; password: string },
    unknown
  >({
    mutationFn: async (credentials) =>
      await api.auth.login(credentials.email, credentials.password),
    onSuccess: (response) => {
      storeTokens(response.access, response.refresh);
      setUser(response.user);
      navigate(AppPath.Home, { replace: true });
    },
  });
};
