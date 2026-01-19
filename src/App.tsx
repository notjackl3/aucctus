import { Loading } from '@components';
import { useDebugModeListener } from '@hooks/debug-mode.hook';
import Page from '@pages';
import AccessGuard from '@routes/guards/access.guard';
import AuthGuard from '@routes/guards/auth.guard';
import { usePrivateRoutes, usePublicRoutes } from '@routes/hooks';
import { AppPath } from '@routes/routes';
import useStore from '@stores/store';
import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';

// Lazy load the public submission form (completely unauthenticated)
const SubmissionLinkPublicForm = React.lazy(
  () => import('@pages/IdeaSubmissions/SubmissionLinkPublicForm'),
);

function App() {
  // Initialize global debug mode listener
  useDebugModeListener();

  // Initialize AI editing conversation auto-clear listeners
  const initializeAiEditingListeners = useStore(
    (state) => state.aiEditing.initializeListeners,
  );

  React.useEffect(() => {
    // Initialize listeners for auto-clearing AI editing conversation
    const cleanup = initializeAiEditingListeners();

    // Cleanup listeners when app unmounts
    return cleanup;
  }, [initializeAiEditingListeners]);

  // Add portal target attribute to toast container
  React.useEffect(() => {
    const addPortalTargetToToasts = () => {
      // Find the toast container
      const toastContainer = document.querySelector(
        '.Toastify__toast-container',
      );
      if (toastContainer) {
        toastContainer.setAttribute('data-aucctus-portal-target', 'true');
      }
    };

    // Add attribute immediately and also observe for new toasts
    addPortalTargetToToasts();

    // Create observer to watch for toast container changes
    const observer = new MutationObserver(addPortalTargetToToasts);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

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

  return (
    <div role='main' className='App'>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Completely Public Routes - No Auth Required */}
          <Route
            path={AppPath.SubmissionLinkPublicForm}
            element={<SubmissionLinkPublicForm />}
          />

          {/* Protected Routes */}
          <Route element={<AuthGuard />}>
            <Route element={<AccessGuard />}>
              <Route path={AppPath.Onboarding} element={<Page.Onboarding />} />

              {/* Private Routes */}
              {/* These are nested inside the Layout Component */}
              {PrivateRoutes}
            </Route>

            {/* Public Routes  */}
            {PublicRoutes}
          </Route>

          <Route path='*' element={<Navigate to={AppPath.Home} replace />} />
        </Routes>

        {/* Global Toast Container Configuration */}
        <ToastContainer
          className='flex flex-col items-end rounded-lg'
          bodyClassName='p-0'
          position='top-right'
          autoClose={5000}
          hideProgressBar={true}
          closeOnClick
          closeButton={true}
          pauseOnHover
          theme='colored'
          transition={Slide}
        />
      </Suspense>
    </div>
  );
}

export default App;
