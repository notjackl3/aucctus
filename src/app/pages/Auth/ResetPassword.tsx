import utils from '@libs/utils';
import { FunctionComponent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';
import styles from '../../assets/styles/pages/auth-screens.module.scss';
import FeatureIcon from '../../components/Icons/FeatureIcon';
import Icon from '../../components/Icons/Icon/Icon';
import InputField from '../../components/Text/InputField/InputField';
import { usePasswordReset } from '../../hooks/query/auth.hook';

const HEADER_TEXT = 'Reset Password';
const SUPPORTING_TEXT = 'Your new password must be different to previously used passwords.';
const ICON_VARIANT: IconVariant = 'key';
const ICON_COLOR = 'purple';

const ResetPassword: FunctionComponent = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPassInputError, setConfirmPassInputError] = useState<string | undefined>();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const { mutate, error } = usePasswordReset();

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
        {error && <div className={styles.error}>{utils.osiris.parseFormError(error)}</div>}
      </div>
      <form className={styles.basicForm}>
        <InputField
          name={'password'}
          label={'Password*'}
          autoComplete='on'
          isPassword
          value={password}
          onChange={_handlePasswordChange}
        />

        <InputField
          name={'confirm-password'}
          label={'Confirm Password*'}
          autoComplete='on'
          isPassword
          error={!!confirmPassInputError}
          errorMessage={confirmPassInputError}
          value={confirmPassword}
          onChange={_handleConfirmPasswordChange}
        />

        <button
          type='submit'
          className='btn btn-primary'
          disabled={!password || !confirmPassword || !!confirmPassInputError || !token}
          onClick={(e) => {
            if (token) {
              mutate(
                { password, confirmPassword, token },
                {
                  onSuccess: () => {
                    navigate(AppPath.ResetPasswordSuccess);
                  },
                },
              );
            }
            e.preventDefault();
          }}
        >
          Reset Password
        </button>
        <div className={styles.signUp}>
          <Link className={`${styles.backArrow}`} to={AppPath.Login}>
            <Icon variant='arrowleft' /> Back to log in
          </Link>
        </div>
      </form>
    </>
  );
};

export default ResetPassword;
