
import React from "react";
import Logo from "../../assets/Logo.png";
import styles from "../../assets/styles/components/drawer.module.scss";
import NavLink from "./NavLink";
import { useSelector } from "react-redux";
import { logout, selectUser } from "../../../features/auth/auth.slice";


import avatar from '../../assets/icons/avatar.svg'
import { AppPath } from "../../../routes/routes";
import { useAppDispatch } from "../../hooks";



const NavDrawer = () => {
  const user = useSelector(selectUser)!
  const dispatch = useAppDispatch()
  // TODO: Get Concept List & Domain Need to set up global state


  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.navDrawer}>
          <div className={styles.content}>
            <img
              alt="Logo"
              style={{ height: 30, width: 146 }}
              src={Logo}
            />
            <NavLink to={AppPath.Home} title="Dashboard" icon="home" />
            <NavLink
              to={AppPath.DomainList}
              title="Domains"
              icon='file'
              openBasePath={AppPath.DomainMarket}
              nestedRoutes={[
                {
                  title: "Market",
                  path: AppPath.DomainMarket
                }
              ]}


            />
            <NavLink to={AppPath.ConceptList} title="Concepts" icon='lightbulb' />
            {/* TODO Fix this */}
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
            <div className={styles.userDetails}

              onClick={() => {
                dispatch(logout())
              }}
            >
              <span>{user.name}</span>
              <span>{user.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default NavDrawer;
