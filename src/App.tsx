import Loading from '@components/Loading';
import Page from '@pages';
import AuthGuard from '@routes/guards/auth.guard';
import { usePrivateRoutes, usePublicRoutes } from '@routes/hooks';
import { AppPath } from '@routes/routes';
import * as Sentry from '@sentry/react';
import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import images from '@assets/img';
import React from 'react';

const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);

function App() {
  // Public Routes (Unauthenticated)
  const PublicRoutes = usePublicRoutes();

  // Private Routes
  const PrivateRoutes = usePrivateRoutes();

  // Preload Concept Generation Background Images
  React.useEffect(() => {
    const aiExplorationsBackground = new Image();
    aiExplorationsBackground.src = images.aiExplorationsBackground;

    const incubationCard = new Image();
    incubationCard.src = images.incubationCard;

    const incubationCard2 = new Image();
    incubationCard2.src = images.incubationCard2;
  }, []);

  return (
    <div role='main' className='App'>
      <Suspense fallback={<Loading />}>
        <SentryRoutes>
          {/* Protected Routes */}
          <Route element={<AuthGuard />}>
            <Route path={AppPath.Onboarding} element={<Page.Onboarding />} />

            {/* Private Routes */}
            {/* These are nested inside the Layout Component */}
            {PrivateRoutes}

            {/* Public Routes  */}
            {PublicRoutes}
          </Route>

          <Route path='*' element={<Navigate to={AppPath.Home} replace />} />
        </SentryRoutes>

        <ToastContainer
          position='bottom-center'
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          theme='colored'
          transition={Slide}
        />
      </Suspense>
    </div>
  );
}

export default App;
