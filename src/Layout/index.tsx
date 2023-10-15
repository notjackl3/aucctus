import { Outlet } from "react-router-dom";
import NavDrawer from "../app/components/NavDrawer"
import styles from "./layout.module.scss"

const Layout = () => {
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