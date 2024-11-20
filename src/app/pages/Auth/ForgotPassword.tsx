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
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleRequestPasswordReset = (e?: React.FormEvent) => {
    e?.preventDefault();
    requestPasswordReset(email, {
      onSuccess: () => setIsSubmitted(true),
    });
  };

  return (
    <>
      <div className={`${styles.header} ${styles.h2}`}>
        <FeatureIcon icon={'key'} color={'purple'} />
        <span className={styles.title}>Forgot Password</span>
        <span className={styles.success}>
          {isSuccess && isSubmitted
            ? 'Instructions to reset your password have been emailed to you.'
            : ''}
        </span>
        <span className={styles.error}>
          {!!error ? utils.osiris.parseFormError(error) : ''}
        </span>
      </div>
      {!isSubmitted ? (
        <form
          className={styles.basicForm}
          onSubmit={handleRequestPasswordReset}
        >
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
          >
            Reset Password
          </button>
        </form>
      ) : null}
      <div className={styles.signUp}>
        <Link className={`${styles.backArrow}`} to={AppPath.Login}>
          <Icon variant='arrowleft' width={20} height={20} /> Back to login
        </Link>
      </div>
    </>
  );
};

export default ForgotPassword;
