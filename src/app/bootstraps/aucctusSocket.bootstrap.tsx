import useStore from '@stores/store';
import React from 'react';
import api from '../../libs/api';
import telemetry from '../../libs/telemetry';
import {
  useUniversalSocketEvents,
  socketEventConfigs,
} from '@hooks/sockets/useUniversalSocketEvents';

const AucctusSocketBootstrap: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthenticated = useStore((state) => !!state.auth.access);
  const mountTime = React.useRef(Date.now());

  // Connect/disconnect based on authentication state
  React.useEffect(() => {
    const isConnected = api.aucctusSocket.isConnected;

    if (isAuthenticated && !isConnected) {
      api.aucctusSocket.connect().catch((error) => {
        telemetry.error('websocket.bootstrap.connect.failed', error);
      });
    } else if (!isAuthenticated && isConnected) {
      api.aucctusSocket.disconnect().catch((error) => {
        telemetry.error('websocket.bootstrap.disconnect.failed', error);
      });
    }
  }, [isAuthenticated]);

  // Cleanup only on real unmount (not route changes)
  React.useEffect(() => {
    const currentMountTime = mountTime.current;
    return () => {
      const mountAge = Date.now() - currentMountTime;
      const isQuickUnmount = mountAge < 1000; // Route change if <1 second

      if (api.aucctusSocket.isConnected) {
        if (isQuickUnmount) {
          telemetry.log('websocket.bootstrap.unmount_skipped', {
            reason: 'route_change_detected',
            mountAge,
          });
        } else {
          telemetry.log('websocket.bootstrap.unmounting', {
            reason: 'app_shutdown',
            mountAge,
          });
          api.aucctusSocket.disconnect();
        }
      }
    };
  }, []);

  // Use universal socket events with default application-wide handling
  useUniversalSocketEvents(socketEventConfigs.universalDefault());

  return <>{children}</>;
};

export default AucctusSocketBootstrap;
