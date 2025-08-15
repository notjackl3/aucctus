import { FunctionComponent, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth, useSignIn } from '@clerk/clerk-react';
import { AppPath } from '../../../routes/routes';
import { Input } from '@components';
import { toast } from '@components';
import telemetry from '@libs/telemetry';

const ResetPassword: FunctionComponent = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const [searchParams] = useSearchParams();

  const [code, setCode] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [confirmPassInputError, setConfirmPassInputError] = useState<
    string | undefined
  >();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get email from URL params (passed from ForgotPassword component)
  const emailFromParams = searchParams.get('email') || '';

  // Clear password mismatch error when passwords match
  useEffect(() => {
    if (password && confirmPassword) {
      if (password === confirmPassword) {
        setConfirmPassInputError(undefined);
      } else {
        setConfirmPassInputError('Passwords do not match');
      }
    }
  }, [password, confirmPassword]);

  // Handle password reset with verification code
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!signInLoaded || !signIn) return;

    if (!code?.trim() || !password || !confirmPassword) {
      if (!code?.trim()) toast.error('Verification code is required');
      else if (!password) toast.error('Password is required');
      else if (!confirmPassword)
        toast.error('Password confirmation is required');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPassInputError('Passwords do not match');
      return;
    }

    setConfirmPassInputError(undefined);
    setIsLoading(true);

    try {
      telemetry.debug('Attempting password reset with code');

      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code.trim(),
        password,
      });

      if (result.status === 'complete') {
        // Password reset successful
        toast.success('Password reset successful!');

        // Full page refresh to homepage so authentication state is re-initialized
        window.location.replace(AppPath.Home);
      } else {
        // Handle any additional verification steps if needed
        telemetry.log(
          'Additional verification required after password reset:',
          result,
        );
        toast.error('Password reset incomplete. Please try again.');
      }
    } catch (err: any) {
      telemetry.error('Password reset error:', err);

      if (err.errors?.[0]?.message) {
        if (
          err.errors[0].message.includes('Invalid code') ||
          err.errors[0].message.includes('expired')
        ) {
          toast.error(
            'Invalid or expired verification code. Please request a new one.',
          );
        } else {
          toast.error(err.errors[0].message);
        }
      } else {
        toast.error('Failed to reset password. Please try again.');
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

  // Main reset password form
  return (
    <div className='flex flex-col items-center justify-center gap-4 self-stretch'>
      <span className='aucctus-text-brand-primary aucctus-header-sm-medium relative self-stretch'>
        Reset Your Password
      </span>
      <span className='aucctus-text-md aucctus-text-tertiary relative self-stretch'>
        {emailFromParams
          ? `Enter the verification code sent to ${emailFromParams} and choose your new password`
          : 'Enter the verification code from your email and choose your new password'}
      </span>

      <form
        className='aucctus-text-sm-medium flex flex-col items-center gap-8 self-stretch'
        onSubmit={handleResetPassword}
      >
        <Input.Field
          label='Verification Code'
          name='code'
          autoComplete='one-time-code'
          value={code}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCode(e.target.value)
          }
          placeholder='Enter the code from your email'
          required
        />

        <Input.Field
          label='New Password'
          name='password'
          autoComplete='new-password'
          isPassword
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          required
        />

        <Input.Field
          label='Confirm New Password'
          name='confirmPassword'
          autoComplete='new-password'
          isPassword
          errorMessage={confirmPassInputError}
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setConfirmPassword(e.target.value)
          }
          required
        />

        <button
          type='submit'
          className='btn btn-primary'
          disabled={
            !code?.trim() ||
            !password ||
            !confirmPassword ||
            !!confirmPassInputError ||
            isLoading
          }
        >
          {isLoading ? 'Resetting Password...' : 'Reset Password'}
        </button>

        <div className='flex flex-col items-center gap-4'>
          <Link
            className='aucctus-text-brand-primary hover:aucctus-text-brand-primary-hover aucctus-text-sm underline'
            to={AppPath.ForgotPassword}
          >
            ← Need a new code? Go back
          </Link>

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
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
