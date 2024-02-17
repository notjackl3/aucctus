import { FunctionComponent, useState } from 'react';
import styles from '../../assets/styles/pages/auth-screens.module.scss';
import InputField from '../../components/InputField';
import AuthProviderIcon from '../../assets/icons/SocialIcon';
import { setAuthenticated } from '../../../features/auth/auth.slice';
import { useAppDispatch } from '../../hooks';
import { parseFormError, validEmail } from '../../../libs/utils';
import { AppPath } from '../../../routes/routes';
import { useQuery } from 'react-query';
import api from '../../../libs/api';
import { IAuthSuccessResponse, ISignInRequest } from '../../../libs/api/typings';
import analytics from '../../../libs/analytics';
import { Link } from 'react-router-dom';

const Login: FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailInputError, setEmailInputError] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const query = useQuery<IAuthSuccessResponse, string>({
    queryKey: 'login',
    enabled: false, // Prevent from automatically running
    refetchOnWindowFocus: false,
    retry: 0,
    queryFn: async () => await api.auth.login(email, password),
    onSuccess: (response: IAuthSuccessResponse) => {
      analytics.debug(JSON.stringify(response));
      dispatch(setAuthenticated(response));
    },
    onError: (error) => {
      let message = parseFormError<ISignInRequest>(error);
      setError(message);
    },
  });

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
      </div>
      {/* TODO: Style this */}
      {error && <div className={styles.error}>{error}</div>}
      <form className={styles.basicForm}>
        <InputField
          label="Email"
          name="email"
          autoComplete="on"
          error={!!emailInputError}
          errorMessage={emailInputError}
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          onFocus={() => setEmailInputError(undefined)}
          onBlur={_handleEmailValidation}
        />

        <InputField
          label="Password"
          name="password"
          autoComplete="on"
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
          <Link className={`${styles.link} btn btn-link`} to="/forgot-password">
            Forgot password
          </Link>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={async (e) => {
            setError(undefined);
            await query.refetch();
            e.preventDefault();
          }}
          disabled={!email || !password || !!emailInputError || query.isFetching || query.isLoading}
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
