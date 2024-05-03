import { useMutation, useQueryClient } from 'react-query';
import api from '../../../libs/api';
import { AucctusQueryKeys } from './query-keys';
import { AxiosError } from 'axios';
import {
  IAuthSuccessResponse,
  IMessageResponse,
  IUpdateForgottenPasswordRequest,
  IServerErrorMessage,
  IRegisterUser,
  ITokenResponse,
} from '../../../libs/api/types';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AucctusLocalStorage } from '../../../libs/localStorage';

export const useSignUp = () => {
  const navigate = useNavigate();

  return useMutation<IMessageResponse, AxiosError<IServerErrorMessage>, IRegisterUser, unknown>({
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
  return useMutation<IMessageResponse, AxiosError<IServerErrorMessage>, string, unknown>({
    mutationFn: async (email: string) => await api.auth.requestPasswordReset(email),
  });
};

export const usePasswordReset = () => {
  return useMutation<IMessageResponse, AxiosError<IServerErrorMessage>, IUpdateForgottenPasswordRequest, unknown>({
    mutationFn: async (credentials) =>
      await api.auth.resetPassword(credentials.password, credentials.confirmPassword, credentials.token),
  });
};

export const useConfirmEmail = () => {
  const queryClient = useQueryClient();
  return useMutation<IMessageResponse, AxiosError<IServerErrorMessage>, string, unknown>({
    mutationFn: async (token: string) => await api.auth.confirmEmail(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AucctusQueryKeys.userDetails });
    },
  });
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<Partial<ITokenResponse>>({
    refresh: AucctusLocalStorage.get('refreshToken'),
    access: undefined,
  });
  const isAuthenticated = useMemo(() => !!tokens.refresh || !!tokens.access, [tokens]);

  const updateTokens = useCallback((tokens: Partial<ITokenResponse>) => {
    api.accessToken = tokens.access;
    setTokens(tokens);

    if (tokens.refresh) {
      AucctusLocalStorage.set('refreshToken', tokens.refresh);
    } else {
      AucctusLocalStorage.remove('refreshToken');
    }
  }, []);

  const refreshToken = useMutation<ITokenResponse, AxiosError<IServerErrorMessage>, void, unknown>({
    mutationFn: async () => (tokens.refresh ? await api.auth.refreshToken(tokens.refresh) : Promise.reject()),
    onSuccess: (response) => {
      updateTokens(response);
    },
  });

  const logout = useMutation<IMessageResponse, AxiosError<IServerErrorMessage>, void, unknown>({
    mutationFn: async () => await api.auth.logout(tokens.refresh),
    onSettled: () => {
      updateTokens({ refresh: undefined, access: undefined });
      queryClient.clear();
      navigate(AppPath.Login);
    },
  });

  const login = useMutation<
    IAuthSuccessResponse,
    AxiosError<IServerErrorMessage>,
    { email: string; password: string },
    unknown
  >({
    mutationFn: async (credentials) => await api.auth.login(credentials.email, credentials.password),
    onSuccess: (response) => {
      updateTokens(response);
      queryClient.invalidateQueries({ queryKey: AucctusQueryKeys.userDetails });
      navigate(AppPath.Home);
    },
  });

  useEffect(() => {
    // Set refresh token and logout actions
    api.setRefreshTokenAction(() => {
      return new Promise((resolve, reject) => {
        if (!tokens.refresh) {
          reject();
          return;
        }

        refreshToken.mutate(undefined, {
          onSuccess: (data) => {
            resolve(data);
          },
          onError: (error) => {
            reject(error);
          },
        });
        return;
      });
    });
    api.setLogoutAction(() => logout.mutate(undefined));
  }, [logout, refreshToken, tokens.refresh]);

  useEffect(() => {
    if (!tokens.refresh) {
      setTokens((prev) => ({ ...prev, refresh: AucctusLocalStorage.get('refreshToken') }));
    }
  }, [tokens]);

  return {
    isAuthenticated,
    refreshToken,
    logout,
    login,
    tokens,
  };
};
