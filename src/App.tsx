
import { Counter } from "./features/counter/Counter"
import "./app/assets/styles/App.css"
import { Route, Routes } from "react-router"
import AuthGuard from "./routes/guards/auth.guard"
import Layout from "./Layout"
import { AuthRoutes } from "./routes/auth.routes"
import { AppPath } from "./routes/routes"
import NotFound from "./app/pages/NotFound"
import Page from "./app/pages"

function App() {

  return (
    <div className="App">
      <Routes>
        <Route index element={<AuthGuard component={<Layout />} />} />
        <Route path={AppPath.Home} element={<AuthGuard component={<Layout />} />} />
        {/* TODO: Add unauth guard and try refresh */}
        <Route path='/signin' element={<Page.Auth.SignIn />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
