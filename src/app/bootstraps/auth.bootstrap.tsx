import { useUser } from '@hooks/query/account.hook';
import useStore from '@stores/store';
import React from 'react';
import api from '../../libs/api';
import LoadingScreen from '../pages/LoadingScreen';
import { useAuth, useUser as useClerkUser } from '@clerk/clerk-react';
import telemetry from '@libs/telemetry';

const AuthBootstrap: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { setInitialized } = useStore((state) => state.auth);
  const { refetch: checkAuthentication, isLoading: isUserDataLoading } =
    useUser();

  // Clerk hooks
  const { isSignedIn, getToken, isLoaded } = useAuth();
  const { user: clerkUser } = useClerkUser();

  // Track if we've set up Clerk token getter and if user data has been fetched
  const [clerkTokenSetupComplete, setClerkTokenSetupComplete] =
    React.useState(false);
  const [userDataFetched, setUserDataFetched] = React.useState(false);

  // Set up Clerk token getter once when Clerk is loaded
  React.useEffect(() => {
    if (isLoaded && !clerkTokenSetupComplete) {
      // Set Clerk token getter for API calls
      api.setClerkTokenGetter(getToken);
      setClerkTokenSetupComplete(true);
      setInitialized(true);
    }
  }, [isLoaded, getToken, clerkTokenSetupComplete, setInitialized]);

  // Handle Clerk authentication state changes
  React.useEffect(() => {
    if (isLoaded && clerkTokenSetupComplete) {
      if (isSignedIn && clerkUser) {
        // User is signed in with Clerk, fetch user data from Django backend
        if (!userDataFetched) {
          checkAuthentication().finally(() => {
            setUserDataFetched(true);
          });
        }

        // Reconnect WebSocket with fresh Clerk token
        api.aucctusSocket.reconnectWithClerkToken().catch((error) => {
          telemetry.error(
            'Failed to reconnect WebSocket with Clerk token:',
            error,
          );
        });
      } else if (!isSignedIn) {
        // User is not signed in, disconnect WebSocket and reset user data state
        api.aucctusSocket.disconnect();
        setUserDataFetched(false);
      }
    }
  }, [
    isLoaded,
    isSignedIn,
    clerkUser,
    clerkTokenSetupComplete,
    checkAuthentication,
    userDataFetched,
  ]);

  // Show loading until Clerk is loaded, token setup is complete, and user data is fetched (if signed in)
  if (!isLoaded || !clerkTokenSetupComplete) {
    return <LoadingScreen />;
  }

  // If user is signed in but we haven't fetched user data yet, show loading
  if (isSignedIn && clerkUser && (!userDataFetched || isUserDataLoading)) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default AuthBootstrap;
