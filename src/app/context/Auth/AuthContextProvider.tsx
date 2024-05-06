import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { UseMutationResult, useMutation, useQueryClient } from 'react-query';
import { IAuthSuccessResponse, IMessageResponse, IServerErrorMessage, ITokenResponse } from '../../../libs/api/types';
import { AucctusLocalStorage } from '../../../libs/localStorage';
import { AxiosError } from 'axios';
import { AucctusQueryKeys } from '../../hooks/query/query-keys';
import api from '../../../libs/api';
import analytics from '../../../libs/analytics';

interface IAuthContext {
  tokens: Partial<ITokenResponse>;
  isAuthenticated: boolean;
  refreshToken: () => Promise<ITokenResponse | undefined>;
  isRefreshLoading: boolean;
  logout: UseMutationResult<IMessageResponse, AxiosError<any>, void, unknown>;
  login: UseMutationResult<
    IAuthSuccessResponse,
    AxiosError<IServerErrorMessage, any>,
    {
      email: string;
      password: string;
    },
    unknown
  >;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export function useAuth(): IAuthContext {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}

interface IAuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<IAuthProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
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

  const { mutateAsync: refreshAsync, isLoading: isRefreshLoading } = useMutation<
    ITokenResponse,
    AxiosError<IServerErrorMessage>,
    void,
    unknown
  >({
    mutationFn: async () => (tokens.refresh ? await api.auth.refreshToken(tokens.refresh) : Promise.reject()),
    onSuccess: (response) => {
      analytics.debug('Refreshed Token Updating Access Token');
      updateTokens(response);
    },
  });

  const logout = useMutation<IMessageResponse, AxiosError<IServerErrorMessage>, void, unknown>({
    mutationFn: async () => await api.auth.logout(tokens.refresh),
    onSettled: () => {
      updateTokens({ refresh: undefined, access: undefined });
      queryClient.clear();
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
    },
  });

  useEffect(() => {
    // Set refresh token and logout actions
    if ((api.hasSetRefreshTokenAction && api.hasSetLogoutAction) || !logout || !tokens.refresh) {
      return;
    }
    api.setRefreshTokenAction(refreshAsync);
    api.setLogoutAction(logout.mutateAsync);
  }, [logout, refreshAsync, tokens.refresh]);

  useEffect(() => {
    const refreshToken = AucctusLocalStorage.get('refreshToken');
    if (refreshToken) {
      setTokens((prev) => ({ ...prev, refresh: refreshToken }));
    }
  }, []);

  useEffect(() => {
    if (api.hasSetRefreshTokenAction) {
      api.refreshToken();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, tokens, refreshToken: api.refreshToken, isRefreshLoading, logout, login }}
    >
      {children}
    </AuthContext.Provider>
  );
};
