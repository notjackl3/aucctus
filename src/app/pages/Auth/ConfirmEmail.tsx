import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';
import styles from '../../assets/styles/pages/auth-screens.module.scss';
import FeatureIcon from '../../components/Icon/FeatureIcon';
import Icon from '../../components/Icon/Icon/Icon';

const ConfirmEmail: FunctionComponent = () => {
  return (
    <>
      <div className={`${styles.header} ${styles.h2}`}>
        <FeatureIcon icon={'mail'} color={'primary'} />
        <span className={styles.title}>Confirm Email</span>
        <span className={styles.supportingText}>
          Please check your email and confirm your email address.
        </span>
      </div>
      <form className={styles.basicForm}>
        <div className={styles.signUp}>
          <Link className={`${styles.backArrow}`} to={AppPath.Login}>
            <Icon
              variant='arrowleft'
              height={20}
              width={20}
              stroke='stroke-primary-800'
            />{' '}
            Back to log in
          </Link>
        </div>
      </form>
    </>
  );
};

export default ConfirmEmail;
