import { Navigate, Outlet } from 'react-router-dom';
import NavDrawer from '../app/components/Navigation/NavDrawer/NavDrawer';
import { AppPath } from '../routes/routes';
import styles from './layout.module.scss';
import { useUserDetails } from '../app/hooks/query/account.hook';

const Layout = () => {
  const { data: userDetails } = useUserDetails();
  const { user } = userDetails || { user: undefined, account: undefined };
  if (user && !user.account) {
    return <Navigate to={AppPath.Onboarding} />;
  }

  return (
    <div className={styles.container}>
      <NavDrawer />
      <Outlet />
    </div>
  );
};

export default Layout;
