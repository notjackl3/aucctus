import { FunctionComponent, useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth, useSignUp } from '@clerk/clerk-react';
import utils from '../../../libs/utils';
import { AppPath } from '../../../routes/routes';
import { Input } from '@components';
import { toast } from '@components';
import telemetry from '@libs/telemetry';

const SignUp: FunctionComponent = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { signUp, isLoaded: signUpLoaded, setActive } = useSignUp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailInputError, setEmailInputError] = useState<string | undefined>();
  const [confirmPassInputError, setConfirmPassInputError] = useState<
    string | undefined
  >();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Extract invitation token from URL
  const invitationToken = searchParams.get('__clerk_ticket');
  const isInvitationFlow = !!invitationToken;

  // If there's no invitation token but user accessed with clerk status, show error
  const clerkStatus = searchParams.get('__clerk_status');
  const hasInvalidInvitation = clerkStatus === 'sign_up' && !invitationToken;

  // Clear email field when in invitation mode since it's not needed
  useEffect(() => {
    if (isInvitationFlow && email) {
      setEmail('');
      setEmailInputError(undefined);
    }
  }, [isInvitationFlow, email]);

  // Handle sign-up with email/password or invitation
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!signUpLoaded || !signUp) return;

    // For invitation flow, we need password and preferably names
    // Email is automatically set from the invitation
    if (isInvitationFlow) {
      if (!password || !confirmPassword) {
        if (!password)
          toast.error(
            'Password Required',
            'Please enter a password to continue',
          );
        else if (!confirmPassword)
          toast.error(
            'Password Confirmation Required',
            'Please confirm your password',
          );
        return;
      }

      if (password !== confirmPassword) {
        setConfirmPassInputError('Passwords do not match');
        return;
      }

      // Encourage providing names for invitation flow
      if (!firstName?.trim() || !lastName?.trim()) {
        telemetry.debug(
          'Names not provided for invitation flow, but continuing',
        );
      }
    } else {
      // Regular signup flow validation
      if (
        !firstName?.trim() ||
        !lastName?.trim() ||
        !email?.trim() ||
        !password ||
        !confirmPassword
      ) {
        if (!firstName?.trim())
          toast.error('First Name Required', 'Please enter your first name');
        else if (!lastName?.trim())
          toast.error('Last Name Required', 'Please enter your last name');
        else if (!email?.trim())
          toast.error('Email Required', 'Please enter your email address');
        else if (!password)
          toast.error('Password Required', 'Please enter a password');
        else if (!confirmPassword)
          toast.error(
            'Password Confirmation Required',
            'Please confirm your password',
          );
        return;
      }

      if (!utils.string.validEmail(email)) {
        setEmailInputError('Email is Invalid.');
        return;
      }

      if (password !== confirmPassword) {
        setConfirmPassInputError('Passwords do not match');
        return;
      }
    }

    setEmailInputError(undefined);
    setConfirmPassInputError(undefined);
    setIsLoading(true);

    try {
      let result;

      if (isInvitationFlow && invitationToken) {
        // Handle invitation-based signup
        telemetry.debug('Creating Clerk account with invitation token:', {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          hasPassword: !!password,
          hasToken: !!invitationToken,
        });

        // For invitation flow, only use strategy, ticket, and password in create
        result = await signUp.create({
          strategy: 'ticket',
          ticket: invitationToken,
          password,
        });

        telemetry.debug('Initial signup result:', result);

        // After successful create, update with names if provided and if signup allows updates
        if (
          (result.status === 'missing_requirements' ||
            result.status === 'complete') &&
          (firstName.trim() || lastName.trim())
        ) {
          try {
            const updateParams: any = {};
            if (firstName.trim()) updateParams.firstName = firstName.trim();
            if (lastName.trim()) updateParams.lastName = lastName.trim();

            telemetry.debug('Updating signup with names:', updateParams);
            const updateResult = await signUp.update(updateParams);

            // Use the update result if it's more complete
            if (
              updateResult.status === 'complete' ||
              updateResult.status !== result.status
            ) {
              result = updateResult;
            }

            telemetry.debug('Update result:', updateResult);
          } catch (updateErr: any) {
            telemetry.error(
              'Failed to update signup with name fields:',
              updateErr,
            );
            // Continue with the original result - names might not be required
          }
        }
      } else {
        // Regular signup flow
        telemetry.debug('Creating Clerk account with:', {
          emailAddress: email.trim(),
          hasPassword: !!password,
        });

        // Create with only allowed params
        result = await signUp.create({
          emailAddress: email.trim(),
          password,
        });

        // Best-effort: attach names after create if provided
        if (firstName.trim() || lastName.trim()) {
          try {
            const updateParams: any = {};
            if (firstName.trim()) updateParams.firstName = firstName.trim();
            if (lastName.trim()) updateParams.lastName = lastName.trim();
            telemetry.debug(
              'Updating signup with names (regular flow):',
              updateParams,
            );
            const updateResult = await signUp.update(updateParams);
            if (
              updateResult.status === 'complete' ||
              updateResult.status !== result.status
            ) {
              result = updateResult;
            }
          } catch (updateErr: any) {
            telemetry.error(
              'Failed to update signup with name fields (regular flow):',
              updateErr,
            );
          }
        }
      }

      if (result.status === 'complete') {
        // Account created and user signed in automatically
        await setActive({ session: result.createdSessionId });
        if (isInvitationFlow) {
          toast.success(
            'Invitation Accepted',
            'Account created successfully! Welcome to Aucctus!',
          );
        } else {
          toast.success(
            'Account Created',
            'Your account has been created successfully!',
          );
        }
        // Don't navigate immediately - let AuthBootstrap handle routing after user data is loaded
      } else {
        // For regular signup, delegate verification to VerifyEmail page
        if (!isInvitationFlow) {
          await signUp.prepareEmailAddressVerification({
            strategy: 'email_code',
          });
          toast.info(
            'Email Verification Required',
            'Please check your email for a verification code',
          );
          const emailParam = email
            ? `email=${encodeURIComponent(email.trim())}`
            : '';
          const sentParam = 'sent=1';
          const query = [emailParam, sentParam].filter(Boolean).join('&');
          navigate(`${AppPath.VerifyEmail}${query ? `?${query}` : ''}`);
        } else {
          // This shouldn't happen with invitation flow, but handle it just in case
          toast.error(
            'Account Creation Failed',
            'Unable to complete account creation. Please try again',
          );
        }
      }
    } catch (err: any) {
      telemetry.error('Sign-up error:', err);
      if (err.errors?.[0]?.message) {
        toast.error('Sign Up Failed', err.errors[0].message);
      } else {
        if (isInvitationFlow) {
          toast.error(
            'Invitation Failed',
            'Failed to accept invitation. Please try again',
          );
        } else {
          toast.error(
            'Sign Up Failed',
            'Unable to create account. Please try again',
          );
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Email verification handled by dedicated VerifyEmail page

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

  // If there's an invalid invitation (clerk status but no token), show error
  if (hasInvalidInvitation) {
    return (
      <div className='flex flex-col items-center justify-center gap-4 self-stretch'>
        <span className='aucctus-text-error-primary aucctus-header-sm-medium relative self-stretch'>
          Invalid Invitation
        </span>
        <span className='aucctus-text-md aucctus-text-tertiary relative self-stretch'>
          The invitation link appears to be invalid or has expired. Please
          contact the person who invited you for a new invitation link.
        </span>
        <Link className='btn btn-primary' to={AppPath.SignUp}>
          Sign up with regular account
        </Link>
      </div>
    );
  }

  // Verification form is no longer shown here; handled in VerifyEmail page

  // Main signup form using Clerk authentication
  return (
    <div className='flex flex-col items-center justify-center gap-4 self-stretch'>
      <span className='aucctus-text-brand-primary aucctus-header-sm-medium relative self-stretch'>
        {isInvitationFlow ? 'Accept Invitation' : 'Create Your Account'}
      </span>
      <span className='aucctus-text-md aucctus-text-tertiary relative self-stretch'>
        {isInvitationFlow
          ? 'Complete your account setup to accept the invitation'
          : 'Sign up for your account'}
      </span>

      <form
        className='aucctus-text-sm-medium flex flex-col items-center gap-8 self-stretch'
        onSubmit={handleSignUp}
      >
        <Input.Field
          label='First Name'
          name='firstName'
          autoComplete='given-name'
          value={firstName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFirstName(e.target.value)
          }
          required={!isInvitationFlow}
        />

        <Input.Field
          label='Last Name'
          name='lastName'
          autoComplete='family-name'
          value={lastName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLastName(e.target.value)
          }
          required={!isInvitationFlow}
        />

        {/* Only show email field for regular signup, not for invitation flow */}
        {!isInvitationFlow && (
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
          />
        )}

        <Input.Field
          label='Password'
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
          label='Confirm Password'
          name='confirmPassword'
          autoComplete='new-password'
          isPassword
          errorMessage={confirmPassInputError}
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setConfirmPassword(e.target.value);
            if (e.target.value !== password) {
              setConfirmPassInputError('Passwords do not match');
            } else {
              setConfirmPassInputError(undefined);
            }
          }}
          required
        />

        <button
          type='submit'
          className='btn btn-primary'
          disabled={
            (!isInvitationFlow && !firstName?.trim()) ||
            (!isInvitationFlow && !lastName?.trim()) ||
            (!isInvitationFlow && !email?.trim()) ||
            !password ||
            !confirmPassword ||
            !!emailInputError ||
            !!confirmPassInputError ||
            isLoading
          }
        >
          {isLoading
            ? isInvitationFlow
              ? 'Accepting Invitation...'
              : 'Creating Account...'
            : isInvitationFlow
              ? 'Accept Invitation'
              : 'Create Account'}
        </button>

        {/* Only show sign in link for regular signup */}
        {!isInvitationFlow && (
          <div className='flex flex-col items-center gap-4'>
            <div className='flex flex-row items-center justify-between px-1'>
              <span className='aucctus-text-tertiary aucctus-text-md'>
                Already have an account?
              </span>
              <Link
                className='btn btn-link !text-gray-light-700 hover:!text-primary-900'
                to={AppPath.Login}
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SignUp;
