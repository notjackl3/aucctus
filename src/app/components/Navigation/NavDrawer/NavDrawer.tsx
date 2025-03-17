import NavLogo from '@assets/aucctus_logo.png';
import NavWord from '@assets/aucctus_nav_word.png';
import { Avatar } from '@components';
import { AppPath } from '@routes/routes';
import { useAuthStore } from '@stores/auth.store';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '../../../hooks/query/auth.hook';
import styles from './drawer.module.scss';
import NavButton from './NavButton';
import NavLink from './NavLink';
import { useState } from 'react';
import { cn } from '@libs/utils/react';

interface NavDrawerProps {
  onExpandCollapse: (isCollapsed: boolean) => void;
}

const NavDrawer = ({ onExpandCollapse }: NavDrawerProps) => {
  const { user, account } = useAuthStore();
  const { mutate: logout } = useLogout();
  const [collapsed, setCollapsed] = useState(true);

  const navigate = useNavigate();

  const handleMouseEnter = () => {
    onExpandCollapse(false);
    setCollapsed(false);
  };

  const handleMouseLeave = () => {
    onExpandCollapse(true);
    setCollapsed(true);
  };

  return (
    <div
      className={cn(styles.container, {
        [styles.collapsed]: collapsed,
      })}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn(styles.wrapper, {
          [styles.collapsed]: collapsed,
        })}
      >
        <div
          className={cn(styles.navDrawer, {
            [styles.collapsed]: collapsed,
          })}
        >
          <div
            className={cn(
              'ml-6 flex cursor-pointer gap-2 pb-4 transition-all duration-300',
              {
                'pointer-events-none': collapsed,
              },
            )}
            onClick={() => {
              navigate(AppPath.Home);
            }}
          >
            <img alt='Aucctus' className='h-12 w-12' src={NavLogo} />
            <img
              alt='Aucctus'
              style={{
                clipPath: collapsed ? 'inset(0 100% 0 0)' : 'inset(0 0 0 0)',
              }}
              className='mt-1 h-10 w-[145px] min-w-[145px] overflow-hidden transition-all duration-300'
              src={NavWord}
            />
          </div>
          <div className={styles.content}>
            <NavLink
              to={AppPath.Home}
              title='Dashboard'
              icon='home'
              collapsed={collapsed}
            />

            <NavLink
              to={
                account?.hasConcepts
                  ? AppPath.ConceptBank
                  : AppPath.IncubateConcept
              }
              title='Concepts'
              icon='lightbulb'
              collapsed={collapsed}
            />
            <NavLink
              to={AppPath.ChallengeCenter}
              title='Challenges'
              icon='rocket'
              locked
              collapsed={collapsed}
            />
          </div>
          <div className={styles.extras}>
            <NavLink
              to={AppPath.SettingsAbout}
              title='Settings'
              icon='file'
              collapsed={collapsed}
            />
            <NavButton
              title='Logout'
              icon='logout'
              onClick={(e) => {
                e.preventDefault();
                logout();
              }}
              collapsed={collapsed}
            />
          </div>
          <div
            className={cn(styles.account, {
              [styles.collapsed]: collapsed,
            })}
          >
            <Avatar
              firstName={user?.firstName || ''}
              lastName={user?.lastName || ''}
              src={user?.profileImage}
              hideImage={!!user?.profileImage}
              className={cn('transition-all duration-300', {
                'ml-[0.75rem]': collapsed,
              })}
            />
            <div
              className={cn(styles.userDetails, {
                [styles.collapsed]: collapsed,
              })}
            >
              <span
                className={cn(
                  'aucctus-text-md-medium aucctus-text-brand-secondary w-40 truncate transition-all duration-300',
                  {
                    'w-0': collapsed,
                    'w-40': !collapsed,
                  },
                )}
              >
                {user?.firstName || ''}
              </span>
              <span
                className={cn(
                  'aucctus-text-xs aucctus-text-tertiary w-40 truncate transition-all duration-300',
                  {
                    'w-0': collapsed,
                    'w-40': !collapsed,
                  },
                )}
              >
                {user?.email || ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavDrawer;
