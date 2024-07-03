import { Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import { usePublicRoutes, usePrivateRoutes } from '@routes/hooks';
import AuthGuard from '@routes/guards/auth.guard';
import { AppPath } from '@routes/routes';
import Page from '@pages';
import Loading from '@components/Loading';

function App() {
  // Public Routes (Unauthenticated)
  const PublicRoutes = usePublicRoutes();

  // Private Routes
  const PrivateRoutes = usePrivateRoutes();

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
