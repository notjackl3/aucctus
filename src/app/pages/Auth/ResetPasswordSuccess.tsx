import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';
import styles from '../../assets/styles/pages/auth-screens.module.scss';
import FeatureIcon from '../../components/Icon/FeatureIcon';

const ResetPasswordSuccess: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className={`${styles.header} ${styles.h2}`}>
        {/* TODO: Get Check Icon */}
        <FeatureIcon icon={'threeStars'} color={'success'} />
        <span className={styles.title}>Password Reset Successful</span>
        <span className={styles.supportingText}>
          Your password has been successfully reset. Click below to login.
        </span>
      </div>
      <div className={styles.basicForm}>
        <button
          className='btn btn-primary'
          onClick={() => navigate(AppPath.Login)}
        >
          Continue to log in
        </button>
      </div>
    </>
  );
};

export default ResetPasswordSuccess;
