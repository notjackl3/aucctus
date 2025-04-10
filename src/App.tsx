import images from '@assets/img';
import Loading from '@components/Loading';
import Page from '@pages';
import AuthGuard from '@routes/guards/auth.guard';
import { usePrivateRoutes, usePublicRoutes } from '@routes/hooks';
import { AppPath } from '@routes/routes';
import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';

// const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);

function App() {
  // Public Routes (Unauthenticated)
  const PublicRoutes = usePublicRoutes();

  // Private Routes
  const PrivateRoutes = usePrivateRoutes();

  React.useEffect(() => {
    if (CSS && 'registerProperty' in CSS) {
      try {
        // @ts-ignore - TypeScript might not recognize this API
        CSS.registerProperty({
          name: '--incubationProgress',
          syntax: '<percentage>',
          initialValue: '0%',
          inherits: false,
        });
      } catch (e) {}
    }

    // Add the keyframes animation to the document
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes progressAnimation { to { --incubationProgress: 100% } }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Preload Concept Generation Background Images
  React.useEffect(() => {
    const preloadImage = (src: string) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    Promise.all([
      preloadImage(images.aiExplorationsBackground),
      preloadImage(images.incubationCard),
      preloadImage(images.incubationCard2),
      preloadImage(images.readyToGenerateGradient),
    ]);
  }, []);

  return (
    <div role='main' className='App'>
      <Suspense fallback={<Loading />}>
        <Routes>
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
        </Routes>

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
