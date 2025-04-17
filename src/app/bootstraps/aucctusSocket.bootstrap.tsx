import useStore from '@stores/store';
import React from 'react';
import api from '../../libs/api';

const AucctusSocketBootstrap: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthenticated = useStore((state) => state.auth.access);

  React.useEffect(() => {
    (async () => {
      if (!api.aucctusSocket.isConnected && isAuthenticated) {
        await api.aucctusSocket.connect();
      }
    })();
    return () => {
      (async () => {
        if (api.aucctusSocket.isConnected) {
          await api.aucctusSocket.disconnect();
        }
      })();
    };
  }, [isAuthenticated]);

  return <>{children} </>;
};

export default AucctusSocketBootstrap;
