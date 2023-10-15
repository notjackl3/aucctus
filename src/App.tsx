
import { Route, Routes } from "react-router"
import AuthGuard from "./routes/guards/auth.guard"
import Layout from "./Layout"
import { AppPath } from "./routes/routes"
import NotFound from "./app/pages/NotFound"
import Page from "./app/pages"
import UnauthGuard from "./routes/guards/unauth.guard"

function App() {

  return (
    <div className="App">
      <Routes>

        {/* Protected Routes */}
        <Route element={<AuthGuard />}>
          <Route path={AppPath.Onboarding} element={<Page.Onboarding />} />
          <Route element={<Layout />}>
            <Route index path={AppPath.Home} element={<Page.Dashboard />} />
          </Route>
        </Route>

        {/* Auth Routes  */}
        <Route element={<UnauthGuard />} >
          <Route index path={AppPath.SignIn} element={<Page.Auth.SignIn />} />
          <Route path={AppPath.SignUp} element={<Page.Auth.SignUp />} />
          <Route path={AppPath.ForgotPassword} element={<Page.Auth.ForgotPassword />} />
          <Route path={AppPath.SignUpSuccess} element={<Page.Auth.SignUpSuccess />} />
          <Route path={AppPath.ConfirmEmail} element={<Page.Auth.ConfirmEmail />} />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
