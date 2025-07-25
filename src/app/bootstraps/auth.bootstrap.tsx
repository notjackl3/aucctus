import { useUser } from '@hooks/query/account.hook';
import { useRefresh } from '@hooks/query/auth.hook';
import useStore from '@stores/store';
import React from 'react';
import api from '../../libs/api';
import LoadingScreen from '../pages/LoadingScreen';
import { useTokenRefreshWatcher } from '../hooks/auth/token-refresh.hook';
import { shouldRefreshToken } from '../../libs/utils/jwt';
import telemetry from '../../libs/telemetry';

const AuthBootstrap: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { access, initialized, clearTokens, setInitialized, isAuthenticated } =
    useStore((state) => state.auth);

  const { mutateAsync: refreshAsync, mutateAsync: refreshToken } = useRefresh();
  const { refetch: checkAuthentication } = useUser();
  const isReauthingRef = React.useRef(false);

  // Add token refresh watcher
  useTokenRefreshWatcher();

  // Use state to trigger a re-render.
  const [refreshActionSet, setRefreshActionSet] = React.useState(false);
  // Use a ref to track if we've already executed the effect logic.
  const effectRan = React.useRef(false);

  // Attempt to re-authenticate when user re-activates the page (blur/focus, visibility change)
  React.useEffect(() => {
    const handleReauth = async () => {
      if (isReauthingRef.current) {
        return;
      }

      isReauthingRef.current = true;

      if (
        document.visibilityState === 'visible' &&
        isAuthenticated() &&
        access &&
        shouldRefreshToken(access, 300)
      ) {
        try {
          telemetry.log(
            'handleReauth - document.visibilityState:',
            document.visibilityState,
            'isAuthenticated',
            isAuthenticated(),
            'access',
            access,
          );
          await refreshToken();
        } catch (error) {
          telemetry.error('Visibility change token refresh failed', error);
        }
      } else {
        telemetry.log(
          'handleReauth - document.visibilityState:',
          document.visibilityState,
          'isAuthenticated',
          isAuthenticated(),
          'access',
          access,
        );
      }

      isReauthingRef.current = false;
    };

    document.addEventListener('visibilitychange', handleReauth);
    window.addEventListener('focus', handleReauth);

    return () => {
      document.removeEventListener('visibilitychange', handleReauth);
      window.removeEventListener('focus', handleReauth);
    };
  }, [access, isAuthenticated, refreshToken]);

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
