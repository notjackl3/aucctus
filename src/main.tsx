import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ModalProvider } from './app/context/ModalContextProvider';
import { QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { parseFormError } from './libs/utils';
import { toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import '~global.scss';
import { AuthProvider } from './app/context/AuthContextProvider';
import { AppProvider } from './app/context/AppContextProvider';

const queryClient = new QueryClient({
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
        <AuthProvider>
          <AppProvider>
            <ModalProvider>
              <App />
            </ModalProvider>
          </AppProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
