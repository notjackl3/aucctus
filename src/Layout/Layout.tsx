import { Outlet, Navigate } from 'react-router-dom';
import NavDrawer from '../app/components/Navigation/NavDrawer/NavDrawer';
import { AppPath } from '../routes/routes';
import styles from './layout.module.scss';
import { useAppStore } from '../app/stores/app.store';

const Layout = () => {
  const { user } = useAppStore();

  if (user && !user.account) {
    return <Navigate to={AppPath.Onboarding} replace />;
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
