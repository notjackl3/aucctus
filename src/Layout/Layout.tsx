import { Navigate, Outlet } from "react-router-dom";
import NavDrawer from "../app/components/NavDrawer/NavDrawer"
import { useSelector } from "react-redux";
import { selectAccessToken, selectOrganization } from "../features/auth/auth.slice";
import { AppPath } from "../routes/routes";
import styles from "../app/assets/styles/layout.module.scss"
import { useAppDispatch } from "../app/hooks";
import { useEffect } from "react";

const Layout = () => {
  const dispatch = useAppDispatch()
  const organization = useSelector(selectOrganization)!;
  const accessToken = useSelector(selectAccessToken)

  useEffect(() => {
  }, [accessToken, dispatch])

  if (!organization) {
    return <Navigate to={AppPath.Onboarding} />
  }

  return (
    <div className={styles.container}>
      <NavDrawer />
      <Outlet />
    </div>
  )

}

export default Layout;