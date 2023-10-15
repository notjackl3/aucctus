import { Navigate, Outlet } from "react-router-dom";
import NavDrawer from "../app/components/NavDrawer"
import styles from "./layout.module.scss"
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/auth.slice";
import { AppPath } from "../routes/routes";

const Layout = () => {
  const user = useSelector(selectUser)!;

  if (!user.organizationId) {
    return <Navigate to={AppPath.Onboarding} />
  }



  return (
    <>
      {/* <NavBar /> */}

      <div className={`${styles.container} container-fluid`}>
        <NavDrawer />
        <main role="main" id="main" className={`${styles.main}`}>
          <div className={styles.header}>{/* <Breadcrumbs /> */}</div>
          <section className={styles.content}>
            <Outlet />
          </section>
        </main>
      </div>

    </>
  )

}

export default Layout;