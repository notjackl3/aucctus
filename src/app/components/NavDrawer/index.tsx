
import React from "react";
// import {
//   Route,
//   Router,
//   // useLocation
// } from "react-router-dom";
import {
  useSpring,
  a,
  // config
} from "@react-spring/web";

import styles from "./drawer.module.scss";

const NavDrawer = () => {


  // Grab the Drawer State to determine if the drawer should be open or not
  const isOpen = false

  // Controls the Animation 
  const { opacity, width, display } = useSpring({
    from: { width: '302px', opacity: 1, display: 'flex' },
    to: async (next) => {
      await next(isOpen ? { display: "flex" } : { opacity: 0 })
      await next(isOpen ? { width: '302px' } : { width: '16px' /*'60px' */ });
      await next(isOpen ? { opacity: 1 } : { display: "none" });
    },
    config: {
      duration: isOpen ? 500 : 150
    }

  });

  return (
    <a.div
      style={{ width }}
      className={`${styles.navDrawer}`}
      data-tut="nav-drawer"
    >
      <a.nav
        style={{ width }}
        className={styles.content}
      >

        <a.div style={{ opacity, display }}
        /* The Drawer Buttons and Links */
        >
          <div className={styles.multiLinkContainer}>
            {/* <Router>
              {Object.entries(Drawer).map(([key, value]) => (
                <Route key={key} path={key} element={value} />
              ))}
            </Router> */}
          </div>
        </a.div>
      </a.nav>
    </a.div>
  );
};

export default NavDrawer;
