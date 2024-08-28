import utils from '@libs/utils';
import { FunctionComponent, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';
import styles from '../../assets/styles/pages/auth-screens.module.scss';
import FeatureIcon from '../../components/Icon/FeatureIcon';
import Icon from '../../components/Icon/Icon/Icon';
import InputField from '../../components/Input/InputField/InputField';
import { useRequestPasswordReset } from '../../hooks/query/auth.hook';

const ForgotPassword: FunctionComponent = () => {
  const [email, setEmail] = useState('');
  const [emailInputError, setEmailInputError] = useState<string | undefined>();

  const {
    mutate: requestPasswordReset,
    isSuccess,
    error,
  } = useRequestPasswordReset();

  const _handleEmailValidation = useCallback(
    (e: React.FocusEvent) => {
      if (email && !utils.string.validEmail(email)) {
        setEmailInputError('Email is Invalid.');
      } else {
        setEmailInputError(undefined);
      }
      e.preventDefault();
    },
    [email],
  );

  return (
    <>
      <div className={`${styles.header} ${styles.h2}`}>
        <FeatureIcon icon={'key'} color={'purple'} />
        <span className={styles.title}>Forgot Password</span>
        <span className={styles.supportingText}>
          {"No worries, we'll send you reset instructions."}
        </span>
        <span className={styles.success}>
          {isSuccess ? 'Reset instructions sent!' : ''}
        </span>
        <span className={styles.error}>
          {!!error ? utils.osiris.parseFormError(error) : ''}
        </span>
      </div>
      <form className={styles.basicForm}>
        <InputField
          name='email'
          label={'Email'}
          type='email'
          placeholder='Enter your email'
          value={email}
          autoComplete='on'
          errorMessage={emailInputError}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          onFocus={() => setEmailInputError(undefined)}
          onBlur={_handleEmailValidation}
        />
        <button
          type='submit'
          className='btn btn-primary'
          disabled={!email || !!emailInputError}
          onClick={(e) => {
            requestPasswordReset(email);
            e.preventDefault();
          }}
        >
          Reset Password
        </button>
        <div className={styles.signUp}>
          <Link className={`${styles.backArrow}`} to={AppPath.Login}>
            <Icon variant='arrowleft' width={20} height={20} /> Back to login
          </Link>
        </div>
      </form>
    </>
  );
};

export default ForgotPassword;
