import { AucctusSocket } from '@libs/api/aucctusSocket';
import React from 'react';
import api from '../../libs/api';

// Define a context type
interface SocketContextContext {
  aucctusSocket: AucctusSocket | null;
}

// Create the context (default is null)
const SocketContext = React.createContext<SocketContextContext>({
  aucctusSocket: null,
});
interface ISocketProviderProps {
  children: React.ReactNode;
}

// Create a provider component
export const SocketProvider: React.FC<ISocketProviderProps> = ({
  children,
}) => {
  const [accountSocket, setAccountSocket] =
    React.useState<AucctusSocket | null>(null);

  React.useEffect(() => {
    // Create a new socket instance
    setAccountSocket(api.aucctusSocket);
    api.aucctusSocket.connect();

    // Optionally, clean up when unmounting
    return () => {
      api.aucctusSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ aucctusSocket: accountSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket context
export const useSocket = () => React.useContext(SocketContext);
