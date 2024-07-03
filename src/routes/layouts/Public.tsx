import React, { FunctionComponent } from 'react';
import { Outlet } from 'react-router-dom';
import styles from '../../app/assets/styles/pages/auth-screens.module.scss';
import Footer from '../../app/components/Auth/Footer/Footer';
import AuthHeader from '../../app/components/Header/AuthHeader/AuthHeader';
import IntoSection from '../../app/components/Auth/IntoSection';

const PublicLayout: FunctionComponent = () => {
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

export default PublicLayout;
