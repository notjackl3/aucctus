
import React from "react";
import Logo from "../../assets/icons/Logo";
import Home from '../../../app/assets/icons/home.svg?react'
import styles from "../../assets/styles/components/drawer.module.scss";
import NavLink from "./NavLink";
import { useSelector } from "react-redux";
import { selectUser } from "../../../features/auth/auth.slice";


import avatar from '../../assets/icons/avatar.svg'



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
    <div className={styles.navDrawer}>
      <div className={styles.content}>
        <Logo />
        <NavLink title="Dashboard" icon="home" />
        <NavLink title="Domains" icon='file' />
        <NavLink title="Concepts" icon='lightbulb' />
        <NavLink title="Tests" icon='rocket' locked />
      </div>
      <div className={styles.extras}>
        <NavLink title="Learn" icon="home" />
        <NavLink title="Settings" icon='file' />

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
  );
};

export default NavDrawer;
