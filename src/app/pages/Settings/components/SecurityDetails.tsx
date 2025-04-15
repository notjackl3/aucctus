import utils from '@libs/utils';
import { FunctionComponent, useMemo, useState } from 'react';
import { useMutation } from 'react-query';
import { toast } from '@components';
import api from '../../../../libs/api';
import { IUserPassword } from '../../../../libs/api/types';
import { defaultToastConfig } from '../../../../libs/toast';
import Icon from '../../../components/Icon/Icon/Icon';
import InputField from '../../../components/Input/InputField/InputField';
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

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { currentPassword, newPassword, confirmPassword } = passwordForm;

  const updatePasswordMutation = useMutation({
    mutationFn: async (passwordObj: IUserPassword) => {
      return api.account.updateUserPassword(passwordObj);
    },
    onSuccess: () => {
      resetFormState();
      setIsFormDisabled(true);
    },
    onError: (error) => {
      const message = utils.osiris.parseFormError<IUserPassword>(error);
      setCurrentPasswordError(message);
      toast.error(
        'Password could not be updated. Please try again later.',
        undefined,
        defaultToastConfig,
      );
    },
  });

  const updatePassword = () => {
    updatePasswordMutation.mutate({
      current_password: passwordForm.currentPassword,
      password: passwordForm.newPassword,
      confirm_password: passwordForm.confirmPassword,
    });
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
              <InputField
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
            disabled={updatePasswordMutation.isLoading}
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
