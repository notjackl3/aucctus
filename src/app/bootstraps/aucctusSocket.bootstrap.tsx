import React from 'react';
import api from '../../libs/api';

const AucctusSocketBootstrap: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  React.useEffect(() => {
    (async () => {
      await api.aucctusSocket.connect();
    })();
    return () => api.aucctusSocket.disconnect();
  }, []);

  return <>{children} </>;
};

export default AucctusSocketBootstrap;
