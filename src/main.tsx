import utils from '@libs/utils';
import { DirectionProvider } from '@radix-ui/react-direction';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import App from './App';
import { ModalProvider } from './app/context/ModalContextProvider';

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
        const message = utils.osiris.parseFormError(error);
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
