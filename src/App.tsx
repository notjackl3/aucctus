import { Route, Routes } from 'react-router';
import AuthGuard from './routes/guards/auth.guard';
import Layout from './Layout/Layout';
import { AppPath } from './routes/routes';
import Page from './app/pages';
import UnauthGuard from './routes/guards/unauth.guard';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Navigate } from 'react-router-dom';

const queryClient = new QueryClient();

function App() {
  return (
    <div role="main" className="App">
      <QueryClientProvider client={queryClient}>
        <Routes>
          {/* Protected Routes */}
          <Route element={<AuthGuard />}>
            <Route path={AppPath.Onboarding} element={<Page.Onboarding />} />
            <Route element={<Layout />}>
              <Route index path={AppPath.Home} element={<Page.Dashboard />} />

              {/* Concepts */}
              <Route path={AppPath.IgniteConcept} element={<Page.IgniteConcept />} />
              <Route path={AppPath.GeneratedConcepts} element={<Page.NotFound />} />
              <Route path={AppPath.ConceptCategory} element={<Page.Concepts />} />
            </Route>
          </Route>

          {/* Auth Routes  */}
          <Route element={<UnauthGuard />}>
            <Route index path={AppPath.Login} element={<Page.Auth.Login />} />
            <Route path={AppPath.SignUp} element={<Page.Auth.SignUp />} />
            <Route path={AppPath.ForgotPassword} element={<Page.Auth.ForgotPassword />} />
            <Route path={AppPath.ResetPassword} element={<Page.Auth.ResetPassword />} />
            <Route path={AppPath.ResetPasswordSuccess} element={<Page.Auth.ResetPasswordSuccess />} />
            <Route path={AppPath.ConfirmEmail} element={<Page.Auth.ConfirmEmail />} /> d
          </Route>
          <Route path="*" element={<Navigate to={AppPath.Home} replace />} />
        </Routes>
      </QueryClientProvider>
    </div>
  );
}

export default App;
