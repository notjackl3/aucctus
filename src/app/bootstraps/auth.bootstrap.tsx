import { useUser } from '@hooks/query/account.hook';
import { useRefresh } from '@hooks/query/auth.hook';
import { useAuthStore } from '@stores/auth.store';
import React from 'react';
import api from '../../libs/api';
import LoadingScreen from '../pages/LoadingScreen';

const AuthBootstrap: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { clearTokens, setInitialized, initialized, access } = useAuthStore();
  const { mutateAsync: refreshAsync } = useRefresh();
  const { refetch: checkAuthentication } = useUser();

  // Use state to trigger a re-render.
  const [refreshActionSet, setRefreshActionSet] = React.useState(false);
  // Use a ref to track if we've already executed the effect logic.
  const effectRan = React.useRef(false);

  React.useEffect(() => {
    // Guard against running twice (e.g. due to StrictMode)
    if (effectRan.current) return;
    effectRan.current = true;

    (async () => {
      if (!refreshActionSet) {
        api.setRefreshTokenAction(refreshAsync, () => {
          setRefreshActionSet(true);
        });
        api.setLogoutAction(clearTokens);
        setInitialized(true);
      }
    })();
  }, [
    refreshAsync,
    clearTokens,
    refreshActionSet,
    checkAuthentication,
    setInitialized,
  ]);

  React.useEffect(() => {
    if (initialized && !!access) {
      checkAuthentication();
    }
  }, [initialized, access, checkAuthentication]);

  if (!refreshActionSet) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default AuthBootstrap;
