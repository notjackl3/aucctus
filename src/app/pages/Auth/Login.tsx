import utils from '@libs/utils';
import { FunctionComponent, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';
import styles from '../../assets/styles/pages/auth-screens.module.scss';
import InputField from '../../components/Input/InputField/InputField';
import { useLogin } from '../../hooks/query/auth.hook';

const Login: FunctionComponent = () => {
  const { mutate: login, error, isLoading } = useLogin();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailInputError, setEmailInputError] = useState<string | undefined>();

  const handleSubmit = () => {
    if (!email || !password || emailInputError) return;

    if (!utils.string.validEmail(email)) {
      setEmailInputError('Email is Invalid.');
      return;
    }
    setEmailInputError(undefined);
    login({ email, password });
  };

  return (
    <>
      <div className={styles.header}>
        <span className={styles.title}>Login</span>
        <span className={styles.supportingText}>
          Welcome back! Please enter your details.
        </span>
        {error && (
          <div className={styles.error}>
            {utils.osiris.parseFormError(error)}
          </div>
        )}
      </div>

      <form
        className={styles.basicForm}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submission
            handleSubmit(); // Call the submit handler
          }
        }}
      >
        <InputField
          label='Email'
          name='email'
          autoComplete='on'
          errorMessage={emailInputError}
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          onFocus={() => setEmailInputError(undefined)}
        />

        <InputField
          label='Password'
          name='password'
          autoComplete='on'
          isPassword
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
        />

        <div className={`${styles.row}`}>
          <Link className={`${styles.link} btn btn-link`} to='/forgot-password'>
            Forgot password
          </Link>
        </div>

        <button
          type='button'
          className='btn btn-primary'
          onClick={handleSubmit}
          disabled={!email || !password || !!emailInputError || isLoading}
        >
          Login
        </button>

        <div className={styles.signUp}>
          <span>{"Don't have an account?"}</span>
          <Link className={`${styles.link} btn btn-link`} to={AppPath.SignUp}>
            Sign up
          </Link>
        </div>
      </form>
    </>
  );
};

export default Login;
