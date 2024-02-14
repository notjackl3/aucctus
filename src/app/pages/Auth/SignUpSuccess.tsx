import { FunctionComponent, useEffect } from 'react';
import styles from '../../assets/styles/pages/auth-screens.module.scss';
import { AppPath } from '../../../routes/routes';
import { useAppDispatch, useQueryParams } from '../../hooks';
import { confirmEmail } from '../../../features/auth/auth.slice';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';

const SignUpSuccess: FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const query = useQueryParams();

  useEffect(() => {
    const token = query.get('token');
    if (token) {
      dispatch(confirmEmail(token));
    }
  }, [dispatch, query]);

  return (
    <>
      <div className={styles.header}>
        <span className={styles.title}>Check Your Email</span>
        <span className={styles.supportingText}>Please confirm your email</span>
      </div>

      <Link className={styles.backArrow} to={AppPath.SignIn}>
        <Icon variant="arrowLeft" width={20} height={20} stroke="#667085" />
        Back to Sign In
      </Link>
    </>
  );
};

export default SignUpSuccess;
