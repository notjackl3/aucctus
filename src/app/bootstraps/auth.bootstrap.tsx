import { useUser } from '@hooks/query/account.hook';
import { useRefresh } from '@hooks/query/auth.hook';
import { useAuthStore } from '@stores/auth.store';
import React from 'react';
import api from '../../libs/api';
import LoadingScreen from '../pages/LoadingScreen';

const AuthBootstrap: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    clearTokens,
    setInitialized,
    initialized,
    user: authUser,
    account: authAccount,
    setUser,
    setAccount,
  } = useAuthStore();
  const { mutateAsync: refreshAsync } = useRefresh();
  const { refetch: checkAuthentication, user, account } = useUser();

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

        await checkAuthentication();

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
    if (!initialized) {
      return;
    }

    if (user && !authUser) {
      setUser(user);
    }

    if (account && !authAccount) {
      setAccount(account);
    }
  }, [user, account, initialized, authUser, authAccount, setUser, setAccount]);

  if (!refreshActionSet) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default AuthBootstrap;
