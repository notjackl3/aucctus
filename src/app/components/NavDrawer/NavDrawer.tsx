import React from 'react';
import Logo from '../../assets/Logo.png';
import styles from '../../assets/styles/components/drawer.module.scss';
import NavLink from './NavLink';
import { useSelector } from 'react-redux';
import { logout, selectUser } from '../../../features/auth/auth.slice';

import avatar from '../../assets/icons/avatar.svg';
import { AppPath } from '../../../routes/routes';
import { useAppDispatch } from '../../hooks';
import { useNavigate } from 'react-router-dom';

const NavDrawer = () => {
  const user = useSelector(selectUser)!;
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.navDrawer}>
          <div
            className={styles.header}
            onClick={() => {
              navigate(AppPath.Home);
            }}
          >
            <img alt="Logo" style={{ height: 30, width: 146 }} src={Logo} />
          </div>
          <div className={styles.content}>
            <NavLink to={AppPath.Home} title="Dashboard" icon="home" />
            <NavLink
              to={AppPath.DomainList}
              title="Domains"
              icon="file"
              // TODO: fix base path logic.
              openBasePath={AppPath.DomainMarket}
              nestedRoutes={[
                {
                  title: 'Market',
                  to: AppPath.DomainMarket,
                },
                {
                  title: 'Start Ups',
                  to: AppPath.Home,
                  locked: true,
                },
                {
                  title: 'Incumbents',
                  to: AppPath.Home,
                  locked: true,
                },
                {
                  title: 'VC Activity',
                  to: AppPath.Home,
                  locked: true,
                },
                {
                  title: 'Potential Concepts',
                  to: AppPath.Home,
                  locked: true,
                },
              ]}
            />
            <NavLink
              to={AppPath.IgniteConcept}
              title="Concepts"
              icon="lightbulb"
              openBasePath={AppPath.Concept}
              nestedRoutes={[
                {
                  title: 'Active Concepts',
                  to: `${AppPath.Concept}/active`,
                },
                {
                  title: 'Drafts',
                  to: `${AppPath.Concept}/draft`,
                },
                {
                  title: 'Archive',
                  to: `${AppPath.Concept}/archive`,
                },
              ]}
            />
            <NavLink to={AppPath.ChallengeCenter} title="Challenges" icon="rocket" />

            <NavLink to={AppPath.Home} title="Tests" icon="beaker" locked />
          </div>
          <div className={styles.extras}>
            <NavLink to={AppPath.Home} title="Learn" icon="home" locked />
            <NavLink to={AppPath.Home} title="Settings" icon="file" />
          </div>
          <div className={styles.account}>
            <img className={styles.avatar} alt="avatar" src={avatar} />
            <div
              className={styles.userDetails}
              onClick={() => {
                dispatch(logout());
              }}
            >
              <span>{user.firstName}</span>
              <span>{user.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavDrawer;
