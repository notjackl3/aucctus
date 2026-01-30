import AuthBootstrap from '@bootstraps/auth.bootstrap';
import utils from '@libs/utils';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { toast } from '@components';
import { ClerkProvider } from '@clerk/clerk-react';
import { setQueryClientRef } from '@stores/overseer/store';
import 'react-toastify/dist/ReactToastify.css';
import '~global.scss';
import App from './App';
import { ModalProvider } from './app/context/ModalContextProvider';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing Clerk Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to your .env file',
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.state.data !== undefined) {
        const message = utils.osiris.parseFormError(error);
        toast.error('Query Error', `Something went wrong: ${message}`);
      }
    },
  }),
});

// Set the query client reference for the overseer store
setQueryClientRef(queryClient);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthBootstrap>
            <ModalProvider>
              <App />
            </ModalProvider>
          </AuthBootstrap>
        </QueryClientProvider>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>,
);
