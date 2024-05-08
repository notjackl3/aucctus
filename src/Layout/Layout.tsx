import { Outlet, Navigate } from 'react-router-dom';
import NavDrawer from '../app/components/Navigation/NavDrawer/NavDrawer';
import { AppPath } from '../routes/routes';
import styles from './layout.module.scss';
import { useUserDetails } from '../app/hooks/query/account.hook';
import { useApp } from '../app/context/AppContextProvider';
import { useEffect } from 'react';
import { useAuth } from '../app/context/AuthContextProvider';

const Layout = () => {
  const { initialized } = useAuth();
  const { account, isLoading: isUserDetailsLoading } = useUserDetails();
  const { showLoading } = useApp();

  useEffect(() => {
    showLoading(isUserDetailsLoading && !initialized && !account);
  }, [isUserDetailsLoading, account, showLoading, initialized]);

  if (!account && !isUserDetailsLoading) {
    return <Navigate to={AppPath.Onboarding} />;
  }

  return (
    <div className={styles.container}>
      <NavDrawer />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
