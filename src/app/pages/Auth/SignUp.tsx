import { FunctionComponent, useCallback, useState } from 'react';

import styles from '../../assets/styles/pages/auth-screens.module.scss';
import InputField from '../../components/InputField';
import { validEmail } from '../../../libs/utils';
import { AppPath } from '../../../routes/routes';
import { useAppDispatch } from '../../hooks';
import { isError, useQuery } from 'react-query';
import api from '../../../libs/api';
import { isAxiosError } from 'axios';
import { IFormError } from '../../../libs/api/typings/avxisi';
import { Link, useNavigate } from 'react-router-dom';
import { IRegisterUser } from '../../../libs/api/typings';

const SignUp: FunctionComponent = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailInputError, setEmailInputError] = useState<string | undefined>();
  const [confirmPassInputError, setConfirmPassInputError] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const query = useQuery({
    queryKey: 'signup',
    retry: 0,
    enabled: false, // Prevent from automatically running
    queryFn: async () => await api.auth.signup(firstName, lastName, email, password, confirmPassword),
    onSuccess: () => {
      navigate(AppPath.SignUpSuccess);
    },
    onError: (error) => {
      let message = 'Unexpected Error Occurred';
      if (isAxiosError<IFormError<IRegisterUser>>(error)) {
        // Check if there is an error response from the server otherwise we will use the default message
        if (error.response) {
          const errorResponse = error.response.data;
          if (typeof errorResponse.error === 'string') {
            message = errorResponse.error;
          } else {
            // For now we are only going to show the first error message
            // Most errors ar caught before they reach the server
            const firstKey = Object.keys(errorResponse.error)[0] as keyof IRegisterUser;
            const firstValue = errorResponse.error[firstKey][0];
            message = `${firstKey}: ${firstValue.message}`;
          }
        } else {
          message = error.message;
        }
      } else if (isError(error)) {
        message = error.message;
      }
      setError(message);
      return message;
    },
  });

  const _handleEmailValidation = useCallback(
    (e: React.FocusEvent) => {
      if (email && !validEmail(email)) {
        setEmailInputError('Email is Invalid.');
      } else {
        setEmailInputError(undefined);
      }
    },
    [email]
  );

  const _handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pass = e.target.value;
    setPassword(pass);
    setConfirmPassErrorOnCondition(!!confirmPassword && confirmPassword !== pass);
  };

  const _handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cPassword = e.target.value;
    setConfirmPassword(cPassword);
    setConfirmPassErrorOnCondition(cPassword !== password);
  };

  const setConfirmPassErrorOnCondition = (condition: boolean) => {
    if (condition) {
      setConfirmPassInputError('Passwords do not match');
    } else {
      setConfirmPassInputError(undefined);
    }
  };

  const _handleSignup = async () => {
    await query.refetch();
  };

  return (
    <>
      <div className={styles.header}>
        <span className={styles.title}>Sign Up</span>
        <span className={styles.supportingText}>Start your 30-day free trial</span>
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <form className={styles.basicForm}>
        <div className={styles.inputGroup}>
          <InputField
            name={'first name'}
            label={'First Name*'}
            autoComplete="on"
            value={firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
          />
          <InputField
            name={'last name'}
            label={'Last Name*'}
            autoComplete="on"
            value={lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
          />
        </div>
        <InputField
          name={'email'}
          label={'Email*'}
          autoComplete="on"
          error={!!emailInputError}
          errorMessage={emailInputError}
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          onFocus={() => setEmailInputError(undefined)}
          onBlur={_handleEmailValidation}
        />
        <InputField
          name={'password'}
          label={'Password*'}
          autoComplete="on"
          isPassword
          value={password}
          onChange={_handlePasswordChange}
        />

        <InputField
          name={'confirm-password'}
          label={'Confirm Password*'}
          autoComplete="on"
          isPassword
          error={!!confirmPassInputError}
          errorMessage={confirmPassInputError}
          value={confirmPassword}
          onChange={_handleConfirmPasswordChange}
        />

        <button
          type="button"
          className="btn btn-primary"
          onClick={_handleSignup}
          disabled={
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !!emailInputError ||
            !!confirmPassInputError ||
            query.isFetching ||
            query.isLoading
          }
        >
          Sign Up
        </button>

        <div className={styles.signUp}>
          <span>Already have an account?</span>
          <Link className={`${styles.link} btn btn-link`} to={AppPath.SignIn}>
            Sign In
          </Link>
        </div>
      </form>
    </>
  );
};

export default SignUp;
