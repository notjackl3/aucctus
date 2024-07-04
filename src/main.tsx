import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ModalProvider } from './app/context/ModalContextProvider';
import { QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { parseFormError } from './libs/utils';
import { toast } from 'react-toastify';
import { DirectionProvider } from '@radix-ui/react-direction';

import 'react-toastify/dist/ReactToastify.css';
import '~global.scss';
import { AppProvider } from './app/context/AppContextProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // 🎉 only show error toasts if we already have data in the cache
      // which indicates a failed background update
      if (query.state.data !== undefined) {
        const message = parseFormError(error);
        toast.error(`Something went wrong: ${message}`);
      }
    },
  }),
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <DirectionProvider dir='ltr'>
          <AppProvider>
            <ModalProvider>
              <App />
            </ModalProvider>
          </AppProvider>
        </DirectionProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
