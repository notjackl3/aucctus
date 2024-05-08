import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import LoadingScreen from '../pages/LoadingScreen';

import { useLocalStorage } from '../hooks/utility.hook';

interface IAppContext {
  isLoading: boolean;
  showLoading: (value: boolean) => void;
}

const AppContext = createContext<IAppContext | undefined>(undefined);

export function useApp(): IAppContext {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within a AppProvider');
  }
  return context;
}

interface IAppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<IAppProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialized, _] = useLocalStorage('initialized');

  useEffect(() => {
    console.log('initialized', initialized);
    if (initialized) {
      setIsLoading(false);
    }
  }, [initialized]);

  const showLoading = useCallback((value: boolean) => {
    if (value) {
      setIsLoading(value);
    } else {
      setTimeout(() => {
        setIsLoading(value);
      }, 1000);
    }
  }, []);

  return (
    <AppContext.Provider value={{ isLoading, showLoading }}>
      {children}
      {isLoading && <LoadingScreen />}
    </AppContext.Provider>
  );
};
