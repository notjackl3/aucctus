import { FunctionComponent, useState } from 'react';
import styles from '../../assets/styles/pages/auth-screens.module.scss';
import InputField from '../../components/Text/InputField/InputField';
import { parseFormError, validEmail } from '../../../libs/utils';
import { AppPath } from '../../../routes/routes';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/Auth/AuthContextProvider';

const Login: FunctionComponent = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailInputError, setEmailInputError] = useState<string | undefined>();

  const { login } = useAuth();

  const _handleEmailValidation = (e: React.FocusEvent) => {
    if (email && !validEmail(email)) {
      setEmailInputError('Email is Invalid.');
    } else {
      setEmailInputError(undefined);
    }
    e.preventDefault();
  };

  return (
    <>
      <div className={styles.header}>
        <span className={styles.title}>Login</span>
        <span className={styles.supportingText}>Welcome back! Please enter your details.</span>
        {login.error && <div className={styles.error}>{parseFormError(login.error)}</div>}
      </div>
      {/* TODO: Style this */}

      <form className={styles.basicForm}>
        <InputField
          label='Email'
          name='email'
          autoComplete='on'
          errorMessage={emailInputError}
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          onFocus={() => setEmailInputError(undefined)}
          onBlur={_handleEmailValidation}
        />

        <InputField
          label='Password'
          name='password'
          autoComplete='on'
          isPassword
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        />

        <div className={`${styles.row}`}>
          {/* Currently Does nothing */}
          {/* <Checkbox
            name="rememberMe"
            supportingText="Remember for 30 Days"
          /> */}

          {/* Takes you to unfinished page */}
          <Link className={`${styles.link} btn btn-link`} to='/forgot-password'>
            Forgot password
          </Link>
        </div>

        <button
          type='button'
          className='btn btn-primary'
          onClick={async (e) => {
            login.mutate({ email, password });
            e.preventDefault();
          }}
          disabled={!email || !password || !!emailInputError || login.isLoading}
        >
          Login
        </button>

        {/* 
        // TEMP: Disable
        <button type="button" className="btn btn-white">
          <AuthProviderIcon provider="google" />
          Sign in with Google
        </button> */}

        <div className={styles.signUp}>
          <span>Don't have an account? </span>
          <Link className={`${styles.link} btn btn-link`} to={AppPath.SignUp}>
            Sign up
          </Link>
        </div>
      </form>
    </>
  );
};

export default Login;
