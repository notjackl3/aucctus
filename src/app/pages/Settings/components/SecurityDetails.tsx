import { FunctionComponent, useMemo, useState } from 'react';
import RowInfo from '../../../components/Container/RowInfo/RowInfo';
import InputField from '../../../components/Text/InputField/InputField';
import styles from '../styles/securityDetails.module.scss';
import { toast } from 'react-toastify';
import { useMutation } from 'react-query';
import api from '../../../../libs/api';
import { defaultToastConfig } from '../../../../libs/toast';
import { IUserPassword } from '../../../../libs/api/types';
import { parseFormError } from '../../../../libs/utils';
import Icon from '../../../components/Icons/Icon/Icon';

const defaultIconProps = {
  width: 20,
  height: 20,
  stroke: '#FFFFFF',
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
      const message = parseFormError<IUserPassword>(error);
      setCurrentPasswordError(message);
      toast.error('Password could not be updated. Please try again later.', defaultToastConfig);
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

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    [isFormDisabled, currentPassword, newPassword, confirmPassword, currentPasswordError]
  );

  return (
    <form
      className={styles.securityDetails}
      onSubmit={(e) => {
        e.preventDefault();
        updatePassword();
      }}
    >
      <div className={styles.headerSection}>
        <div className={styles.headerDescription}>
          <h3 className={styles.headerTitle}>Change Your Password</h3>
          <div className={styles.headerSubtitle}>Please enter your current password to change your password.</div>
        </div>
      </div>
      {userSecurity.map((info, i) => (
        <RowInfo
          key={`${info.name}-${i}`}
          label={info.label}
          render={
            <div className={styles.inputGroup}>
              <InputField
                variant="settings"
                type="password"
                isPassword
                name={info.name}
                disabled={info.isDisabled}
                label={''}
                error={info.error}
                errorMessage={info.errorMessage}
                hint={info.hint}
                autoComplete="on"
                value={info.value}
                onChange={handlePasswordInputChange}
              />
            </div>
          }
        />
      ))}
      <div className={styles.securityActions}>
        {!isFormDisabled && (
          <button
            type="button"
            className={`btn btn-light btn-bold`}
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
            type="button"
            className={`btn btn-primary btn-bold`}
            onClick={(e) => {
              e.preventDefault();
              setIsFormDisabled(false);
            }}
          >
            <Icon variant="edit" {...defaultIconProps} />
            Update password
          </button>
        ) : (
          <button className={`btn btn-primary btn-bold`} type="submit" disabled={updatePasswordMutation.isLoading}>
            <Icon variant="save" {...defaultIconProps} />
            Save
          </button>
        )}
      </div>
    </form>
  );
};

export default SecurityDetails;
