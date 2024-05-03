import { FunctionComponent } from 'react';
import styles from './auth-header.module.scss';
import Logo from '../../../assets/Logo.png';
import { useAuth } from '../../../hooks/query/auth.hook';

const AuthHeader: FunctionComponent = () => {
  const { logout } = useAuth();
  return (
    <div className={styles.authHeader}>
      <div
        className={styles.logo}
        onClick={() => {
          // Used in the case of onboarding where the user is actually logged in but are not tied to their multi-tenancy "Account".
          logout.mutate();
        }}
      >
        <img alt='Logo' style={{ height: 30, width: 146 }} src={Logo} />
      </div>
    </div>
  );
};

export default AuthHeader;
