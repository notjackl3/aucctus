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
import { selectedConcept } from '../../../features/concepts/concept.slice';
import App from '../../../App';

const NavDrawer = () => {
  const user = useSelector(selectUser)!;
  const conceptId = useSelector(selectedConcept);
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
              to={AppPath.ConceptList}
              title="Concepts"
              icon="lightbulb"
              openBasePath={`/concept/${conceptId || ':id'}`}
              nestedRoutes={[
                {
                  title: 'Overview',
                  to: AppPath.ConceptOverview.replace(':id', conceptId || ':id'),
                },
                {
                  title: 'Business Model',
                  to: AppPath.Home,
                  locked: true,
                },
                {
                  title: 'Financial Projection',
                  to: AppPath.Home,
                  locked: true,
                },
                {
                  title: 'Customer Profile',
                  to: AppPath.ConceptCustomerPersona.replace(':id', conceptId || ':id'),
                },
                {
                  title: 'Related Market',
                  to: AppPath.Home,
                  locked: true,
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
              <span>{user.name}</span>
              <span>{user.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavDrawer;
