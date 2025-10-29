import { FunctionComponent, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth, useSignUp } from '@clerk/clerk-react';
import utils from '../../../libs/utils';
import { AppPath } from '../../../routes/routes';
import { Input } from '@components';
import { toast } from '@components';
import telemetry from '@libs/telemetry';

const VerifyEmail: FunctionComponent = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { signUp, isLoaded: signUpLoaded, setActive } = useSignUp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>(searchParams.get('email') || '');
  const [code, setCode] = useState<string>('');
  const [emailInputError, setEmailInputError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [verificationSent, setVerificationSent] = useState<boolean>(
    searchParams.get('sent') === '1',
  );

  // Shared logic for sending verification email
  const sendVerificationEmail = async () => {
    if (!email) {
      toast.error('Email Required', 'Please enter your email address');
      return;
    }

    if (!utils.string.validEmail(email)) {
      setEmailInputError('Email is Invalid.');
      return;
    }

    setEmailInputError(undefined);

    if (!signUpLoaded || !signUp) {
      toast.error('Service Not Ready', 'Service not ready. Please try again');
      return;
    }

    try {
      setIsLoading(true);

      // First try to create a new sign-up if one doesn't exist
      try {
        await signUp.create({
          emailAddress: email.trim(),
        });
      } catch (err: any) {
        // If user already exists, that's fine - we'll try to resend verification
        if (!err.errors?.[0]?.message?.includes('already exists')) {
          throw err;
        }
      }

      // Prepare email verification
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      setVerificationSent(true);
      toast.success(
        'Verification Email Sent',
        'Please check your inbox for the verification code',
      );
    } catch (err: any) {
      telemetry.error('Send verification error:', err);
      if (err.errors?.[0]?.message) {
        toast.error('Verification Failed', err.errors[0].message);
      } else {
        toast.error(
          'Verification Failed',
          'Failed to send verification email. Please try again',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending verification email form submission
  const handleSendVerification = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    await sendVerificationEmail();
  };

  // Handle email verification with code
  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!signUp || !code) {
      toast.error(
        'Verification Code Required',
        'Please enter the verification code',
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.verifications?.emailAddress?.status === 'verified') {
        toast.success(
          'Email Verified',
          'Your email has been verified successfully!',
        );

        // Check if this completes the sign-up process
        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          toast.success(
            'Account Activated',
            'Account activated! Redirecting...',
          );
          // Don't navigate immediately - let AuthBootstrap handle routing
        } else {
          toast.success(
            'Email Verified',
            'Email verified! You can now sign in with your account.',
          );
          // Redirect to login page after successful verification
          navigate(AppPath.Login);
        }
      } else {
        toast.error(
          'Invalid Verification Code',
          'Invalid verification code. Please try again',
        );
      }
    } catch (err: any) {
      telemetry.error('Verification error:', err);

      // Handle the case where verification has already been completed
      if (
        err.errors?.[0]?.message?.includes('already been verified') ||
        err.errors?.[0]?.code === 'verification_already_verified'
      ) {
        toast.success(
          'Email Already Verified',
          'Email already verified! You can now sign in',
        );
        navigate(AppPath.Login);
      } else if (err.errors?.[0]?.message) {
        toast.error('Verification Failed', err.errors[0].message);
      } else {
        toast.error(
          'Verification Failed',
          'Verification failed. Please try again',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If Clerk is not loaded yet, show loading
  if (!isLoaded || !signUpLoaded) {
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

  // Show verification code form if email has been sent
  if (verificationSent) {
    return (
      <div className='flex flex-col items-center justify-center gap-4 self-stretch'>
        <span className='aucctus-text-brand-primary aucctus-header-sm-medium relative self-stretch'>
          Verify Your Email
        </span>
        <span className='aucctus-text-md aucctus-text-tertiary relative self-stretch'>
          Please enter the verification code sent to {email}
        </span>

        <form
          className='aucctus-text-sm-medium flex flex-col items-center gap-8 self-stretch'
          onSubmit={handleVerifyCode}
        >
          <Input.Field
            label='Verification Code'
            name='code'
            autoComplete='one-time-code'
            value={code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCode(e.target.value)
            }
          />

          <button
            type='submit'
            className='btn btn-primary'
            disabled={!code || isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>

          <div className='flex flex-col items-center gap-4'>
            <button
              type='button'
              onClick={() => {
                setVerificationSent(false);
                setCode('');
              }}
              className='aucctus-text-brand-primary hover:aucctus-text-brand-primary-hover aucctus-text-sm underline'
            >
              ← Back to email entry
            </button>

            <button
              type='button'
              onClick={sendVerificationEmail}
              className='aucctus-text-tertiary hover:aucctus-text-secondary aucctus-text-xs underline'
              disabled={isLoading}
            >
              Resend verification email
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Main email entry form
  return (
    <div className='flex flex-col items-center justify-center gap-4 self-stretch'>
      <span className='aucctus-text-brand-primary aucctus-header-sm-medium relative self-stretch'>
        Verify Your Email
      </span>
      <span className='aucctus-text-md aucctus-text-tertiary relative self-stretch'>
        Enter your email address to receive a verification code
      </span>

      <form
        className='aucctus-text-sm-medium flex flex-col items-center gap-8 self-stretch'
        onSubmit={handleSendVerification}
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
        />

        <button
          type='submit'
          className='btn btn-primary'
          disabled={!email || !!emailInputError || isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Verification Email'}
        </button>

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
      </form>
    </div>
  );
};

export default VerifyEmail;
