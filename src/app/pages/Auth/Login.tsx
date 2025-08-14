import utils from '@libs/utils';
import { FunctionComponent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useSignIn } from '@clerk/clerk-react';
import { AppPath } from '../../../routes/routes';
import InputField from '../../components/Input/InputField/InputField';
import { toast } from '@components';
import telemetry from '@libs/telemetry';

const Login: FunctionComponent = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { signIn, isLoaded: signInLoaded, setActive } = useSignIn();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailInputError, setEmailInputError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handle sign-in with email/password
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!signInLoaded || !signIn) return;

    if (!email || !password) return;

    if (!utils.string.validEmail(email)) {
      setEmailInputError('Email is Invalid.');
      return;
    }
    setEmailInputError(undefined);

    setIsLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        toast.success('Successfully signed in!');
        // Don't navigate immediately - let AuthBootstrap handle routing after user data is loaded
      } else {
        // Handle multi-factor auth or other verification steps
        telemetry.log('Additional verification required:', result);
        toast.error('Additional verification required');
      }
    } catch (err: any) {
      telemetry.error('Sign-in error:', err);
      const code = err?.errors?.[0]?.code;
      if (code === 'strategy_for_user_invalid') {
        // Migrated user without a password: redirect to Forgot Password to set one
        toast.info('This account requires a password reset to sign in.');
        const query = `${email ? `?email=${encodeURIComponent(email)}` : ''}${email ? '&' : '?'}resetRequired=1`;
        navigate(`${AppPath.ForgotPassword}${query}`);
        return;
      }
      if (err.errors?.[0]?.message) {
        toast.error(err.errors[0].message);
      } else {
        toast.error('Sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If Clerk is not loaded yet, show loading
  if (!isLoaded || !signInLoaded) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        Loading...
      </div>
    );
  }

  // If user is already signed in with Clerk, show loading while AuthBootstrap handles routing
  if (isSignedIn) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        Loading...
      </div>
    );
  }

  // Main login form using Clerk authentication
  return (
    <div className='flex flex-col items-center justify-center gap-4 self-stretch'>
      <span className='aucctus-text-brand-primary aucctus-header-sm-medium relative self-stretch'>
        Welcome back
      </span>
      <span className='aucctus-text-md aucctus-text-tertiary relative self-stretch'>
        Sign in to your account
      </span>

      <form
        className='aucctus-text-sm-medium flex flex-col items-center gap-8 self-stretch'
        onSubmit={handleSignIn}
      >
        <InputField
          label='Email'
          name='email'
          autoComplete='email'
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
          autoComplete='current-password'
          isPassword
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
        />

        <div className='aucctus-text-sm-medium aucctus-text-secondary flex w-full flex-row items-center justify-between px-0'>
          <Link
            className='btn btn-link p-0 !text-gray-light-700 hover:!text-primary-900'
            to={AppPath.ForgotPassword}
          >
            Forgot password
          </Link>
          <Link
            className='btn btn-link p-0 !text-gray-light-700 hover:!text-primary-900'
            to={`${AppPath.VerifyEmail}${email ? `?email=${encodeURIComponent(email)}` : ''}`}
          >
            Verify email
          </Link>
        </div>

        <button
          type='submit'
          className='btn btn-primary'
          disabled={!email || !password || !!emailInputError || isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
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
    </div>
  );
};

export default Login;
