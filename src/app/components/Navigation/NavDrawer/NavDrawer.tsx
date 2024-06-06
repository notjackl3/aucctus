import React from 'react';
import Logo from '../../../assets/Logo.png';
import styles from './drawer.module.scss';
import NavLink from './NavLink';
import avatar from '../../../assets/avatar.svg';
import { AppPath } from '../../../../routes/routes';
import { useNavigate } from 'react-router-dom';
import { useUserDetails } from '../../../hooks/query/account.hook';
import NavButton from './NavButton';
import { useLogout } from '../../../hooks/query/auth.hook';

const NavDrawer = () => {
  const { user, account } = useUserDetails();
  const { mutate: logout } = useLogout();

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
            <img alt='Logo' style={{ height: 30, width: 146 }} src={Logo} />
          </div>
          <div className={styles.content}>
            <NavLink to={AppPath.Home} title='Dashboard' icon='home' />

            <NavLink
              to={
                account?.hasConcepts
                  ? {
                      pathname: AppPath.ConceptCategory,
                      search: '?category=active',
                    }
                  : AppPath.IgniteConcept
              }
              title='Concepts'
              icon='lightbulb'
              openBasePath={AppPath.Concept}
              nestedRoutes={[
                {
                  title: 'Active',
                  to: {
                    pathname: AppPath.ConceptCategory,
                    search: '?category=active',
                  },
                },
                {
                  title: 'Drafts',
                  to: {
                    pathname: AppPath.ConceptCategory,
                    search: '?category=draft',
                  },
                },
                {
                  title: 'Archive',

                  to: {
                    pathname: AppPath.ConceptCategory,
                    search: '?category=archive',
                  },
                },
              ]}
            />
            <NavLink to={AppPath.ChallengeCenter} title='Challenges' icon='rocket' locked />
          </div>
          <div className={styles.extras}>
            <NavLink to={AppPath.SettingsAbout} title='Settings' icon='file' />
            <NavButton
              title='Logout'
              icon='logout'
              onClick={(e) => {
                e.preventDefault();
                logout();
              }}
            />
          </div>
          <div className={styles.account}>
            <img className={styles.avatar} alt='avatar' src={avatar} />
            <div className={styles.userDetails}>
              <span>{user?.firstName || ''}</span>
              <span>{user?.email || ''}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavDrawer;
