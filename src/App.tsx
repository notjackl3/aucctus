import { Suspense } from 'react';
import { Route, Routes } from 'react-router';
import AuthGuard from './routes/guards/auth.guard';
import Layout from './Layout/Layout';
import { AppPath, ConceptPath } from './routes/routes';
import Page from './app/pages';
import UnauthGuard from './routes/guards/unauth.guard';
import { QueryClient, QueryClientProvider, QueryCache } from 'react-query';
import { Navigate } from 'react-router-dom';
import { Slide, ToastContainer, toast } from 'react-toastify';
import Loading from './app/components/Loading';
import { parseFormError } from './libs/utils';

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

function App() {
  return (
    <div role="main" className="App">
      {/* TODO: Create Loading Screen */}
      <Suspense fallback={<Loading />}>
        <QueryClientProvider client={queryClient}>
          <Routes>
            {/* Protected Routes */}
            <Route element={<AuthGuard />}>
              <Route path={AppPath.Onboarding} element={<Page.Onboarding />} />
              <Route element={<Layout />}>
                <Route index path={AppPath.Home} element={<Page.Dashboard />} />
                {/* Concepts */}
                <Route path={AppPath.IgniteConcept} element={<Page.IgniteConcept />} />
                <Route path={AppPath.ConceptSnapshot} element={<Page.ConceptSnapshot />} />
                <Route path={AppPath.GeneratedConcepts} element={<Page.GeneratedConcepts />} />
                <Route path={AppPath.ConceptCategory} element={<Page.Concepts />} />

                <Route path={AppPath.ConceptOverview} element={<Page.ConceptPages.ConceptReport />}>
                  <Route index element={<Page.ConceptPages.OverviewDetails />} />
                  <Route path={ConceptPath.MarketScan} element={<Page.ConceptPages.MarketDetails />} />
                  <Route path={ConceptPath.FinancialProjection} element={<Page.ConceptPages.FinancialDetails />} />
                  <Route path={ConceptPath.CustomerProfile} element={<Page.ConceptPages.CustomerProfile />} />
                  <Route path={ConceptPath.KeyAssumptions} element={<Page.ConceptPages.HypothesisDetails />} />
                </Route>
                {/* Settings */}
                <Route path={AppPath.Settings} element={<Page.SettingsPages.Settings />}>
                  <Route index path={AppPath.SettingsAbout} element={<Page.SettingsPages.AboutDetails />} />
                  <Route index path={AppPath.SettingsSecurity} element={<Page.SettingsPages.SecurityDetails />} />
                </Route>
              </Route>
            </Route>

            {/* Auth Routes  */}
            <Route element={<UnauthGuard />}>
              <Route index path={AppPath.Login} element={<Page.Auth.Login />} />
              <Route path={AppPath.SignUp} element={<Page.Auth.SignUp />} />
              <Route path={AppPath.ForgotPassword} element={<Page.Auth.ForgotPassword />} />
              <Route path={AppPath.ResetPassword} element={<Page.Auth.ResetPassword />} />
              <Route path={AppPath.ResetPasswordSuccess} element={<Page.Auth.ResetPasswordSuccess />} />
              <Route path={AppPath.ConfirmEmail} element={<Page.Auth.ConfirmEmail />} />
              <Route path={AppPath.EmailConfirmation} element={<Page.Auth.EmailConfirmation />} /> d
            </Route>
            <Route path="*" element={<Navigate to={AppPath.Home} replace />} />
          </Routes>
        </QueryClientProvider>
        <ToastContainer
          position="bottom-center"
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          theme="colored"
          transition={Slide}
        />
      </Suspense>
    </div>
  );
}

export default App;
