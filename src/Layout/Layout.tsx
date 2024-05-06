import { Outlet, useNavigate } from 'react-router-dom';
import NavDrawer from '../app/components/Navigation/NavDrawer/NavDrawer';
import { AppPath } from '../routes/routes';
import styles from './layout.module.scss';
import { useUserDetails } from '../app/hooks/query/account.hook';
import { useEffect } from 'react';

const Layout = () => {
  const { account } = useUserDetails();
  const navigate = useNavigate();

  useEffect(() => {
    if (!account) {
      navigate(AppPath.Onboarding);
    }
  }, [account, navigate]);

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
