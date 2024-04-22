import { FunctionComponent } from 'react';
import styles from '../assets/styles/components/auth-header.module.scss';
import Logo from '../assets/Logo.png';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../routes/routes';
import { logout } from '../../features/auth/auth.slice';
import { useAppDispatch } from '../store';

const AuthHeader: FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  return (
    <div className={styles.authHeader}>
      <div
        className={styles.logo}
        onClick={() => {
          // Used in the case of onboarding where the user is actually logged in but are not tied to their multi-tenancy "Account".
          dispatch(logout());
          navigate(AppPath.Login);
        }}
      >
        <img alt="Logo" style={{ height: 30, width: 146 }} src={Logo} />
      </div>
    </div>
  );
};

export default AuthHeader;
