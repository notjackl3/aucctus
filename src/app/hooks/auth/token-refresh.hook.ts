import { useEffect, useRef } from 'react';
import useStore from '@stores/store';
import { shouldRefreshToken } from '../../../libs/utils/jwt';
import { useRefresh } from '../query/auth.hook';
import analytics from '../../../libs/telemetry';

export const useTokenRefreshWatcher = () => {
  const access = useStore((state) => state.auth.access);
  const isAuthenticated = useStore((state) => state.auth.isAuthenticated);
  const { mutateAsync: refreshToken } = useRefresh();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isAuthenticated() || !access) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Check token every 60 seconds
    intervalRef.current = setInterval(async () => {
      try {
        if (access && shouldRefreshToken(access, 300)) {
          // 5 minutes buffer
          analytics.debug('Periodic token refresh triggered');
          await refreshToken();
        }
      } catch (error) {
        analytics.error('Periodic token refresh failed', error);
      }
    }, 60000); // Check every minute

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [access, isAuthenticated, refreshToken]);
};
