import { FunctionComponent } from 'react';
import { Outlet } from 'react-router-dom';
import styles from '../../app/assets/styles/pages/auth-screens.module.scss';
import Footer from '../../app/components/Auth/Footer/Footer';
import { Header } from '@components';
import IntoSection from '../../app/components/Auth/IntoSection';

const PublicLayout: FunctionComponent = () => {
  return (
    <div className={`${styles.authContainer}`}>
      <div className={`${styles.formSection}`}>
        <Header.Auth />
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
