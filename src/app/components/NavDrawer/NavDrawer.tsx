
import React from "react";
import Logo from "../../assets/Logo.svg?react";
import styles from "../../assets/styles/components/drawer.module.scss";
import NavLink from "./NavLink";
import { useSelector } from "react-redux";
import { selectUser } from "../../../features/auth/auth.slice";


import avatar from '../../assets/icons/avatar.svg'
import { AppPath } from "../../../routes/routes";



const NavDrawer = () => {
  const user = useSelector(selectUser)!

  // Grab the Drawer State to determine if the drawer should be open or not
  // const isOpen = false

  // Controls the Animation 
  // const { opacity, width, display } = useSpring({
  //   from: { width: '150', opacity: 1, display: 'flex' },
  //   to: async (next) => {
  //     await next(isOpen ? { display: "flex" } : { opacity: 0 })
  //     await next(isOpen ? { width: '302px' } : { width: '16px' /*'60px' */ });
  //     await next(isOpen ? { opacity: 1 } : { display: "none" });
  //   },
  //   config: {
  //     duration: isOpen ? 500 : 150
  //   }
  // });

  return (
    <div className={styles.wrapper}>
      <div className={styles.navDrawer}>
        <div className={styles.content}>
          <Logo width={146} height={30} />
          <NavLink to={AppPath.Home} title="Dashboard" icon="home" />
          <NavLink to={AppPath.DomainOpportunities} title="Domains" icon='file' />
          {/* TODO Fix this */}
          <NavLink to={AppPath.DomainOpportunities} title="Concepts" icon='lightbulb' />
          <NavLink to={AppPath.Home} title="Tests" icon='rocket' locked />
        </div>
        <div className={styles.extras}>
          <NavLink to={AppPath.Home} title="Learn" icon="home" />
          <NavLink to={AppPath.Home} title="Settings" icon='file' />

        </div>
        <div className={styles.account}>
          <img
            className={styles.avatar}
            alt='avatar'
            src={avatar}
          />
          <div className={styles.userDetails}>
            <span>{user.name}</span>
            <span>{user.email}</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NavDrawer;
