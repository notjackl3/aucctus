import Logo from '@assets/Logo-black.png';
import { Avatar } from '@components';
import { AppPath } from '@routes/routes';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '../../../hooks/query/auth.hook';
import { useAppStore } from '../../../stores/app.store';
import styles from './drawer.module.scss';
import NavButton from './NavButton';
import NavLink from './NavLink';

const NavDrawer = () => {
  const { user, account } = useAppStore();
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
            <img alt='Aucctus' style={{ width: 165 }} src={Logo} />
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
            <Avatar firstName={user?.firstName || ''} lastName={user?.lastName || ''} hideImage />
            <div className={styles.userDetails}>
              <span className='w-40 truncate text-base font-medium leading-tight text-slate-500'>
                {user?.firstName || ''}
              </span>
              <span className='w-40 truncate text-sm font-normal leading-tight text-gray-500'>{user?.email || ''}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavDrawer;
