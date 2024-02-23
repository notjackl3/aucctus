import { FunctionComponent, useCallback, useState } from 'react';
import styles from '../../assets/styles/pages/auth-screens.module.scss';
import InputField from '../../components/InputField';
import FeatureIcon from '../../components/FeatureIcon';
import { validEmail } from '../../../libs/utils';
import { AppPath } from '../../../routes/routes';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import { useQuery } from 'react-query';
import api from '../../../libs/api';

const ForgotPassword: FunctionComponent = () => {
  const [email, setEmail] = useState('');
  const [emailInputError, setEmailInputError] = useState<string | undefined>();

  const query = useQuery({
    queryKey: 'forgot-password',
    retry: 3,
    enabled: false, // Prevent from automatically running
    queryFn: async () => await api.auth.forgotPassword(email),
    onSuccess: () => {
      // TODO: handle success
    },
    onError: () => {
      // TODO: handle error
    },
  });

  const _handleEmailValidation = useCallback(
    (e: React.FocusEvent) => {
      if (email && !validEmail(email)) {
        setEmailInputError('Email is Invalid.');
      } else {
        setEmailInputError(undefined);
      }
      e.preventDefault();
    },
    [email]
  );

  return (
    <>
      <div className={`${styles.header} ${styles.h2}`}>
        <FeatureIcon icon={'key'} color={'purple'} />
        <span className={styles.title}>Forgot Password</span>
        <span className={styles.supportingText}>No worries, we'll send you reset instructions.</span>
      </div>
      <form className={styles.basicForm}>
        <InputField
          name="email"
          label={'Email'}
          type="email"
          placeholder="Enter your email"
          value={email}
          autoComplete="on"
          error={!!emailInputError}
          errorMessage={emailInputError}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          onFocus={() => setEmailInputError(undefined)}
          onBlur={_handleEmailValidation}
        />
        <button type="submit" className="btn btn-primary" onClick={() => query.refetch()}>
          Reset Password
        </button>
        <div className={styles.signUp}>
          <Link className={`${styles.backArrow}`} to={AppPath.Login}>
            <Icon variant="arrowLeft" /> Back to login
          </Link>
        </div>
      </form>
    </>
  );
};

export default ForgotPassword;
