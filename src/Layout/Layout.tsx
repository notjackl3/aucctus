import { Navigate, Outlet } from "react-router-dom";
import NavDrawer from "../app/components/NavDrawer/NavDrawer"
import { useSelector } from "react-redux";
import { selectOrganization } from "../features/auth/auth.slice";
import { AppPath } from "../routes/routes";
import styles from "../app/assets/styles/layout.module.scss"
const Layout = () => {
  const organization = useSelector(selectOrganization)!;

  if (!organization) {
    return <Navigate to={AppPath.Onboarding} />
  }

  return (
    <div className={styles.container}>
      <NavDrawer />
      <main role="main" id="main" className={`${styles.main}`}>
        {/* <div className={styles.header}><Breadcrumbs /></div> */}
        <section className={styles.content}>
          <Outlet />
        </section>
      </main>
    </div>
  )

}

export default Layout;