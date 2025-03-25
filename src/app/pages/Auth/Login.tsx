import utils from '@libs/utils';
import { FunctionComponent, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';
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
      <div className='flex flex-col items-center justify-center gap-4 self-stretch'>
        <span className='aucctus-text-brand-primary aucctus-header-sm-medium relative self-stretch'>
          Login
        </span>
        <span className='aucctus-text-md aucctus-text-tertiary relative self-stretch'>
          Welcome back! Please enter your details.
        </span>
        {error && (
          <div className='aucctus-text-error-primary aucctus-text-lg'>
            {utils.osiris.parseFormError(error)}
          </div>
        )}
      </div>

      <form
        className='aucctus-text-sm-medium flex flex-col items-center gap-8 self-stretch'
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

        <div className='aucctus-text-sm-medium aucctus-text-secondary px- flex w-full flex-row items-center justify-between'>
          <Link
            className='btn btn-link !text-gray-light-700 hover:!text-primary-900'
            to='/forgot-password'
          >
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

        <div className='flex flex-row items-center justify-between px-1'>
          <span className='aucctus-text-tertiary aucctus-text-md'>
            {"Don't have an account?"}
          </span>
          <Link
            className='btn btn-link !text-gray-light-700 hover:!text-primary-900'
            to={AppPath.SignUp}
          >
            Sign up
          </Link>
        </div>
      </form>
    </>
  );
};

export default Login;
