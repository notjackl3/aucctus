import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { UseMutationResult, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { IAuthSuccessResponse, IMessageResponse, IServerErrorMessage, ITokenResponse } from '../../libs/api/types';
import { AxiosError } from 'axios';
import { AppPath } from '../../routes/routes';
import { AucctusQueryKeys } from '../hooks/query/query-keys';
import api from '../../libs/api';
import analytics from '../../libs/analytics';
import { useLocalStorage, useSessionStorage } from '../hooks/utility.hook';
import { hasTokenExpired } from '../../libs/utils';
import TokenRefreshWrapper from './TokenRefresh';

interface IAuthContext {
  tokens: Partial<ITokenResponse>;
  initialized: boolean;
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
  const navigate = useNavigate();
  const [hasSetRefreshTokenAction, setRefreshTokenAction] = useState<boolean>(false);
  const [initialized, setInitialized] = useSessionStorage<boolean>('initialized');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setUser] = useLocalStorage('user');

  const [refresh, setRefresh] = useLocalStorage<string | undefined>('refreshToken');
  const [access, setAccess] = useState<string | undefined>(undefined);

  const isAuthenticated = useMemo(() => !!refresh || !!access, [access, refresh]);

  const updateTokens = useCallback((tokens: Partial<ITokenResponse>) => {
    setAccess(tokens.access);
    setRefresh(tokens.refresh);
    api.accessToken = tokens.access;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearTokens = useCallback(() => {
    queryClient.clear();
    updateTokens({ refresh: undefined, access: undefined });
    navigate(AppPath.Login, { replace: true });
    setUser(undefined);
  }, [navigate, queryClient, updateTokens, setUser]);

  const { mutateAsync: refreshAsync, isLoading: isRefreshLoading } = useMutation<
    ITokenResponse,
    AxiosError<IServerErrorMessage>,
    void,
    unknown
  >({
    mutationFn: async () => {
      if (!refresh) {
        return Promise.reject();
      }

      if ((access && hasTokenExpired(access)) || !access) {
        analytics.debug('Making Refresh Token Request');
        return await api.auth.refreshToken(refresh);
      }

      return Promise.resolve({ refresh, access });
    },
    onSuccess: (response) => {
      analytics.debug('Refreshed Token Updating Access Token');
      updateTokens(response);
    },
    onError: (error) => {
      analytics.error('Error refreshing token', error);
      clearTokens();
    },
  });

  const logout = useMutation<IMessageResponse, AxiosError<IServerErrorMessage>, void, unknown>({
    mutationFn: async () => await api.auth.logout(access),
    onSettled: () => {
      clearTokens();
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
      navigate(AppPath.Home, { replace: true });
    },
  });

  useEffect(() => {
    if (!hasSetRefreshTokenAction) {
      api.setRefreshTokenAction(refreshAsync, () => {
        setRefreshTokenAction(true);
      });
      api.setLogoutAction(clearTokens);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        initialized: !!initialized,
        tokens: { access, refresh },
        refreshToken: api.refreshToken,
        isRefreshLoading,
        logout,
        login,
      }}
    >
      <TokenRefreshWrapper
        refreshToken={api.refreshToken}
        refreshActionReady={hasSetRefreshTokenAction}
        initialized={!!initialized}
        setInitialized={setInitialized}
      >
        {children}
      </TokenRefreshWrapper>
    </AuthContext.Provider>
  );
};
