import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import LoadingScreen from '../pages/LoadingScreen';
import api from '../../libs/api';
import { useRefresh } from '../hooks/query/auth.hook';
import { ITokenResponse } from '../../libs/api/types';
import { useTokenStore } from '../stores/token.store';
import { useAppStore } from '../stores/app.store';
import { useUserDetails } from '../hooks/query/account.hook';

interface IAppContext {
  isLoading: boolean;
  showLoading: (value: boolean) => void;
  access: string | undefined;
  refresh: string | undefined;
  initialized: boolean;
  isAuthenticated: boolean;
  refreshToken: () => Promise<ITokenResponse | undefined>;
  isRefreshLoading: boolean;
}

const AppContext = createContext<IAppContext | undefined>(undefined);

export function useApp(): IAppContext {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

interface IAppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<IAppProviderProps> = ({ children }) => {
  const { initialized, initializeApp, user } = useAppStore();
  const { clearTokens, access, refresh, retrieveTokens, hasRetrievedTokens } = useTokenStore();
  const [hasSetRefreshTokenAction, setHasSetRefreshTokenAction] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { mutateAsync: refreshAsync, isLoading: isRefreshLoading } = useRefresh();
  const isAuthenticated = useMemo(() => !!refresh && !!access && !!initialized, [refresh, access, initialized]);

  const showLoading = useCallback((value: boolean) => {
    if (value) {
      setIsLoading(value);
    } else {
      setTimeout(() => {
        setIsLoading(value);
      }, 1000);
    }
  }, []);

  useUserDetails(isAuthenticated); // Fetch user details if we don't have them and we are authenticated

  // First try to retrieve tokens from storage
  useEffect(() => {
    if (!hasRetrievedTokens) {
      retrieveTokens();
    }
  }, [hasRetrievedTokens, retrieveTokens]);

  // Set the refresh token action for the API
  useEffect(() => {
    if (!hasSetRefreshTokenAction && refreshAsync) {
      api.setRefreshTokenAction(refreshAsync, () => {
        setHasSetRefreshTokenAction(true);
      });
      api.setLogoutAction(clearTokens);
    }
  }, [hasSetRefreshTokenAction, refreshAsync, clearTokens]);

  // Once the Action has been set and we've attempted to retrieve tokens, try to refresh the token
  // This will only happen once
  useEffect(() => {
    (async () => {
      console.log('refreshing token');
      if (!initialized && hasSetRefreshTokenAction && hasRetrievedTokens) {
        await api.refreshToken().finally(() => {
          initializeApp();
        });
      }
    })();
  }, [hasSetRefreshTokenAction, initialized, hasRetrievedTokens, initializeApp]);

  useEffect(() => {
    showLoading(!initialized || isRefreshLoading);
  }, [showLoading, initialized, isRefreshLoading]);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        initialized: !!initialized,
        access,
        refresh,
        refreshToken: api.refreshToken,
        isRefreshLoading,
        isLoading,
        showLoading,
      }}
    >
      {children}
      {isLoading && <LoadingScreen />}
    </AppContext.Provider>
  );
};
