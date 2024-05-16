import { Outlet, Navigate } from 'react-router-dom';
import NavDrawer from '../app/components/Navigation/NavDrawer/NavDrawer';
import { AppPath } from '../routes/routes';
import styles from './layout.module.scss';
import { useUserDetails } from '../app/hooks/query/account.hook';

const Layout = () => {
  const { account, isLoading: isUserDetailsLoading } = useUserDetails();

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
