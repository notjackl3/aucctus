import { FunctionComponent, useEffect } from 'react';
import { useAppDispatch, useQueryParams } from '../../hooks';
import { Link } from 'react-router-dom';
import { confirmEmail } from '../../../features/auth/auth.slice';

import styles from '../../assets/styles/pages/auth-screens.module.scss';
import FeatureIcon from '../../components/FeatureIcon';
import { AppPath } from '../../../routes/routes';
import Icon from '../../components/Icon';

const ConfirmEmail: FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const queryParams = useQueryParams();

  const token = queryParams.get('token');

  useEffect(() => {
    if (token) {
      dispatch(confirmEmail(token));
    }
  }, [dispatch, token]);

  return (
    <>
      <div className={`${styles.header} ${styles.h2}`}>
        <FeatureIcon icon={'mail'} color={'purple'} />
        <span className={styles.title}>Confirm Email</span>
        <span className={styles.supportingText}>Please check your email and confirm your email address.</span>
      </div>
      <form className={styles.basicForm}>
        <div className={styles.signUp}>
          <Link className={`${styles.backArrow}`} to={AppPath.Login}>
            <Icon variant="arrowLeft" /> Back to log in
          </Link>
        </div>
      </form>
    </>
  );
};

export default ConfirmEmail;
