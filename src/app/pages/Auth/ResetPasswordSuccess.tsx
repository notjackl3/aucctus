import { FunctionComponent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';
import styles from '../../assets/styles/pages/auth-screens.module.scss';
import FeatureIcon from '../../components/Icon/FeatureIcon';
import Icon from '../../components/Icon/Icon/Icon';

const ResetPasswordSuccess: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className={`${styles.header} ${styles.h2}`}>
        {/* TODO: Get Check Icon */}
        <FeatureIcon icon={'threeStars'} color={'green'} />
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
          Continue
        </button>
        <div className={styles.signUp}>
          <Link className={`${styles.backArrow}`} to={AppPath.Login}>
            <Icon variant='arrowleft' /> Back to log in
          </Link>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordSuccess;
