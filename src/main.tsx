import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { persistor, store } from './app/store';
import App from './App';
import './app/assets/styles/global.scss';
import { HashRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
// Used to Circular Progress Bar on Concept Overview page
import 'react-circular-progressbar/dist/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import { ModalProvider } from './app/context/modal/ModalContextProvider';
import { QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { parseFormError } from './libs/utils';
import { toast } from 'react-toastify';

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
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <HashRouter>
          <QueryClientProvider client={queryClient}>
            <ModalProvider>
              <App />
            </ModalProvider>
          </QueryClientProvider>
        </HashRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
