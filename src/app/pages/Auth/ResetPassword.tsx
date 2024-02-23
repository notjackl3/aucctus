import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import styles from '../../assets/styles/pages/auth-screens.module.scss';
import InputField from '../../components/InputField';
import FeatureIcon from '../../components/FeatureIcon';
import { AppPath } from '../../../routes/routes';
import { Link, useNavigate } from 'react-router-dom';
import Icon, { IconVariant } from '../../components/Icon';
import { useQuery } from 'react-query';
import api from '../../../libs/api';
import { isAxiosError } from 'axios';
import { useQueryParams } from '../../hooks';
import { parseFormError } from '../../../libs/utils';
import { IPasswordResetForm } from '../../../libs/api/typings';

const HEADER_TEXT = 'Reset Password';
const SUPPORTING_TEXT = 'Your new password must be different to previously used passwords.';
const ICON_VARIANT: keyof typeof IconVariant = 'key';
const ICON_COLOR = 'purple';

const ResetPassword: FunctionComponent = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // TODO: Display Error message
  const [error, setError] = useState<string | undefined>();
  const [confirmPassInputError, setConfirmPassInputError] = useState<string | undefined>();
  const queryParams = useQueryParams();

  const token = useMemo(() => queryParams.get('token'), [queryParams]);

  const query = useQuery({
    queryKey: 'forgot-password',
    retry: 0,
    enabled: false, // Prevent from automatically running
    queryFn: async () => (token ? await api.auth.resetPassword(password, confirmPassword, token) : void 0),
    onSuccess: () => {
      navigate(`${AppPath.ResetPasswordSuccess}`);
    },
    onError: (error) => {
      const message = parseFormError<IPasswordResetForm>(error);
      setError(message);
    },
  });

  const _handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pass = e.target.value;
    setPassword(pass);
    setConfirmPassErrorOnCondition(!!confirmPassword && confirmPassword !== pass);
    e.preventDefault();
  };

  const _handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cPassword = e.target.value;
    setConfirmPassword(cPassword);
    setConfirmPassErrorOnCondition(cPassword !== password);
    e.preventDefault();
  };

  const setConfirmPassErrorOnCondition = (condition: boolean) => {
    if (condition) {
      setConfirmPassInputError('Passwords do not match');
    } else {
      setConfirmPassInputError(undefined);
    }
  };

  return (
    <>
      <div className={`${styles.header} ${styles.h2}`}>
        <FeatureIcon icon={ICON_VARIANT} color={ICON_COLOR} />
        <span className={styles.title}>{HEADER_TEXT}</span>
        <span className={styles.supportingText}>{SUPPORTING_TEXT}</span>
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <form className={styles.basicForm}>
        <InputField
          name={'password'}
          label={'Password*'}
          autoComplete="on"
          isPassword
          value={password}
          onChange={_handlePasswordChange}
        />

        <InputField
          name={'confirm-password'}
          label={'Confirm Password*'}
          autoComplete="on"
          isPassword
          error={!!confirmPassInputError}
          errorMessage={confirmPassInputError}
          value={confirmPassword}
          onChange={_handleConfirmPasswordChange}
        />

        <button type="submit" className="btn btn-primary" onClick={() => query.refetch()}>
          Reset Password
        </button>
        <div className={styles.signUp}>
          <Link className={`${styles.backArrow}`} to={AppPath.Login}>
            <Icon variant="arrowLeft" /> Back to log in
          </Link>
        </div>
      </form>
    </>
  );
};

export default ResetPassword;
