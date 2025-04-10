import AuthBootstrap from '@bootstraps/auth.bootstrap';
import utils from '@libs/utils';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '~global.scss';
import App from './App';
import { ModalProvider } from './app/context/ModalContextProvider';

// if (__ENVIRONMENT__ !== 'development') {
//   Sentry.init({
//     environment: __ENVIRONMENT__,
//     release: __APP_VERSION__,
//     dsn: import.meta.env.VITE_SENTRY_DNS,
//     integrations: [
//       Sentry.browserTracingIntegration(),
//       Sentry.replayIntegration(),
//       Sentry.reactRouterV6BrowserTracingIntegration({
//         useEffect: React.useEffect,
//         useLocation,
//         useNavigationType,
//         createRoutesFromChildren,
//         matchRoutes,
//       }),
//     ],
//     // Tracing
//     tracesSampleRate: 1.0, //  Capture 100% of the transactions
//     // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
//     tracePropagationTargets: [
//       'localhost',
//       /^https?:\/\/([^.]+\.)*aucctus\.com/,
//     ],
//     // Session Replay
//     replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
//     replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
//   });
// }

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
        <AuthBootstrap>
          <ModalProvider>
            <App />
          </ModalProvider>
        </AuthBootstrap>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
