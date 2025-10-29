import { FunctionComponent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useSignIn } from '@clerk/clerk-react';
import utils from '../../../libs/utils';
import { AppPath } from '../../../routes/routes';
import { Input } from '@components';
import { toast } from '@components';
import telemetry from '@libs/telemetry';

const ForgotPassword: FunctionComponent = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [emailInputError, setEmailInputError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const emailFromParams = searchParams.get('email') || '';
  const resetRequired = searchParams.get('resetRequired') === '1';

  useEffect(() => {
    if (emailFromParams) {
      setEmail(emailFromParams);
    }
  }, [emailFromParams]);

  // Handle sending password reset code
  const handleSendResetCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!signInLoaded || !signIn) return;

    if (!email?.trim()) {
      toast.error(
        'Email Required',
        'Please enter your email address to continue',
      );
      return;
    }

    if (!utils.string.validEmail(email)) {
      setEmailInputError('Email is Invalid.');
      return;
    }

    setEmailInputError(undefined);
    setIsLoading(true);

    try {
      telemetry.debug('Initiating password reset for:', {
        email: email.trim(),
      });

      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email.trim(),
      });

      toast.success(
        'Reset Code Sent',
        resetRequired
          ? 'Password reset required. Check your email for the reset code.'
          : 'Password reset code sent to your email!',
      );
      // Redirect directly to reset password page
      navigate(`${AppPath.ResetPassword}?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      telemetry.error('Password reset request error:', err);

      if (err.errors?.[0]?.code === 'form_identifier_not_found') {
        toast.error(
          'Account Not Found',
          'No account found with this email address. Please check your email or sign up for a new account.',
        );
      } else if (err.errors?.[0]?.message) {
        toast.error('Reset Code Failed', err.errors[0].message);
      } else {
        toast.error(
          'Reset Code Failed',
          'Unable to send reset code. Please try again',
        );
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

  // Main forgot password form
  return (
    <div className='flex flex-col items-center justify-center gap-4 self-stretch'>
      <span className='aucctus-text-brand-primary aucctus-header-sm-medium relative self-stretch'>
        {resetRequired ? 'Reset your password' : 'Forgot Your Password?'}
      </span>
      <span className='aucctus-text-md aucctus-text-tertiary relative self-stretch'>
        Enter your email address and we&apos;ll send you a code to reset your
        password. If you&apos;re a new user or haven&apos;t set a password yet,
        this will let you create one.
      </span>

      <form
        className='aucctus-text-sm-medium flex flex-col items-center gap-8 self-stretch'
        onSubmit={handleSendResetCode}
      >
        <Input.Field
          label='Email'
          name='email'
          autoComplete='email'
          errorMessage={emailInputError}
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          onFocus={() => setEmailInputError(undefined)}
          required
          disabled={resetRequired}
        />

        <button
          type='submit'
          className='btn btn-primary'
          disabled={!email?.trim() || !!emailInputError || isLoading}
        >
          {isLoading ? 'Sending Code...' : 'Send Reset Code'}
        </button>

        <div className='flex flex-col items-center gap-4'>
          <div className='flex flex-row items-center justify-between px-1'>
            <span className='aucctus-text-tertiary aucctus-text-md'>
              Remember your password?
            </span>
            <Link
              className='btn btn-link !text-gray-light-700 hover:!text-primary-900'
              to={AppPath.Login}
            >
              Sign in
            </Link>
          </div>

          <div className='flex flex-row items-center justify-between px-1'>
            <span className='aucctus-text-tertiary aucctus-text-md'>
              Don&apos;t have an account?
            </span>
            <Link
              className='btn btn-link !text-gray-light-700 hover:!text-primary-900'
              to={AppPath.SignUp}
            >
              Sign up
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
