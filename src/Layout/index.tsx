import NavDrawer from "../app/components/NavDrawer"
import { AppRoutes } from "../routes/app.routes";
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
            <AppRoutes />
          </section>
        </main>
      </div>

    </>
  )

}

export default Layout;