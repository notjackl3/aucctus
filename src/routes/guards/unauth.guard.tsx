import React, { FunctionComponent } from 'react';
import { hasAccessToken } from '../../features/auth/auth.slice';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import styles from '../../app/assets/styles/pages/auth-screens.module.scss';
import Footer from '../../app/components/Footer';
import AuthHeader from '../../app/components/AuthHeader';
import IntoSection from '../../app/components/IntoSection';
import { useSelector } from 'react-redux';
import { AppPath } from '../routes';

const UnauthGuard: FunctionComponent = () => {
  const location = useLocation();
  const isAuthenticated = useSelector(hasAccessToken);

  if (isAuthenticated) {
    return <Navigate to={AppPath.Home} state={{ from: location }} replace />;
  }

  return (
    <div className={`${styles.authContainer}`}>
      <div className={`${styles.formSection}`}>
        <AuthHeader />
        <div className={styles.form}>
          <Outlet />
        </div>
        <Footer />
      </div>
      <IntoSection />
    </div>
  );
};

export default UnauthGuard;
