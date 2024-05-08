import React, { FunctionComponent, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import styles from '../../app/assets/styles/pages/auth-screens.module.scss';
import Footer from '../../app/components/Auth/Footer/Footer';
import AuthHeader from '../../app/components/Header/AuthHeader/AuthHeader';
import IntoSection from '../../app/components/Auth/IntoSection';
import { useAuth } from '../../app/context/AuthContextProvider';
import { AppPath } from '../routes';

const UnauthGuard: FunctionComponent = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(AppPath.Home, { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
