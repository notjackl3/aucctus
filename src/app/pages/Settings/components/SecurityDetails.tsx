import { FunctionComponent, useMemo, useState } from 'react';
import { toast, Input } from '@components';
import { useReverification, useUser } from '@clerk/clerk-react';
import {
  isClerkRuntimeError,
  isReverificationCancelledError,
} from '@clerk/clerk-react/errors';
import Icon from '../../../components/Icon/Icon/Icon';
import RowInfo from '../../../components/Text/RowInfo/RowInfo';

const defaultIconProps = {
  width: 20,
  height: 20,
  className: 'stroke-primary-25',
};

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const SecurityDetails: FunctionComponent = () => {
  const [isFormDisabled, setIsFormDisabled] = useState(true);
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const { currentPassword, newPassword, confirmPassword } = passwordForm;
  const { user } = useUser();

  // Define the protected password update function that requires reverification
  const performPasswordUpdate = async () => {
    if (!user) {
      throw new Error('User not found. Please try again.');
    }

    await user.updatePassword({
      currentPassword: currentPassword,
      newPassword: newPassword,
      signOutOfOtherSessions: true,
    });
  };

  // Use useReverification to wrap the password update function
  const updatePasswordWithReverification = useReverification(
    performPasswordUpdate,
  );

  const updatePassword = async () => {
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setCurrentPasswordError('New passwords do not match.');
      return;
    }

    // Validate password length
    if (newPassword.length < 8) {
      setCurrentPasswordError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    setCurrentPasswordError('');

    try {
      // This will trigger reverification if needed, then execute performPasswordUpdate
      await updatePasswordWithReverification();

      toast.successAnimated(
        'Password Updated',
        'Password updated successfully!',
      );
      resetFormState();
      setIsFormDisabled(true);
    } catch (error: any) {
      // Handle if user cancels the reverification process
      if (isClerkRuntimeError(error) && isReverificationCancelledError(error)) {
        toast.info(
          'Password Update Cancelled',
          'Password update was cancelled',
        );
        setCurrentPasswordError('');
        return;
      }

      // Handle Clerk-specific errors
      const errorMessage = error?.errors?.[0]?.message || error?.message;

      if (
        errorMessage?.includes('current password') ||
        errorMessage?.includes('incorrect')
      ) {
        setCurrentPasswordError('Current password is incorrect.');
      } else if (
        errorMessage?.includes('password') &&
        errorMessage?.includes('weak')
      ) {
        setCurrentPasswordError(
          'New password is too weak. Please choose a stronger password.',
        );
      } else {
        setCurrentPasswordError(
          errorMessage || 'Failed to update password. Please try again.',
        );
      }

      toast.errorAnimated(
        'Password Update Failed',
        'Password could not be updated. Please try again later.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetFormState = () => {
    setCurrentPasswordError('');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCurrentPasswordError('');
    const { name, value } = e.target;
    setPasswordForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const userSecurity = useMemo(
    () => [
      {
        label: 'Current password',
        value: currentPassword,
        name: 'currentPassword',
        error: !!currentPasswordError,
        errorMessage: currentPasswordError,
        isDisabled: isFormDisabled,
      },
      {
        label: 'New password',
        value: newPassword,
        name: 'newPassword',
        isDisabled: isFormDisabled,
        hint: 'Password must be at least 8 characters.',
      },
      {
        label: 'Confirm new password',
        value: confirmPassword,
        name: 'confirmPassword',
        isDisabled: isFormDisabled,
      },
    ],
    [
      isFormDisabled,
      currentPassword,
      newPassword,
      confirmPassword,
      currentPasswordError,
    ],
  );

  return (
    <form
      className='flex w-full flex-col'
      onSubmit={(e) => {
        e.preventDefault();
        updatePassword();
      }}
    >
      <div className='mb-8 flex flex-row items-start justify-between'>
        <div className='flex flex-col'>
          <h3 className='aucctus-text-lg aucctus-text-brand-primary'>
            Change Your Password
          </h3>
          <div className='aucctus-text-sm aucctus-text-tertiary'>
            Please enter your current password to change your password.
          </div>
        </div>
      </div>
      {userSecurity.map((info, i) => (
        <RowInfo
          key={`${info.name}-${i}`}
          label={info.label}
          render={
            <div className='w-full max-w-md'>
              <Input.Field
                variant='settings'
                type='password'
                isPassword
                name={info.name}
                disabled={info.isDisabled}
                label={''}
                errorMessage={info.errorMessage}
                hint={info.hint}
                autoComplete='on'
                value={info.value}
                onChange={handlePasswordInputChange}
              />
            </div>
          }
        />
      ))}
      <div className='mt-6 flex justify-end gap-4'>
        {!isFormDisabled && (
          <button
            type='button'
            className='btn btn-light btn-bold'
            onClick={(e) => {
              e.preventDefault();
              setIsFormDisabled(true);
              resetFormState();
            }}
          >
            Cancel
          </button>
        )}
        {isFormDisabled ? (
          <button
            type='button'
            className='btn btn-primary btn-bold'
            onClick={(e) => {
              e.preventDefault();
              setIsFormDisabled(false);
            }}
          >
            <Icon variant='edit' {...defaultIconProps} />
            Update Password
          </button>
        ) : (
          <button
            className='btn btn-primary btn-bold'
            type='submit'
            disabled={isLoading}
          >
            <Icon variant='save' {...defaultIconProps} />
            Save
          </button>
        )}
      </div>
    </form>
  );
};

export default SecurityDetails;
