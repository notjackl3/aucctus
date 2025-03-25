import { FunctionComponent, useState } from 'react';
import { Link } from 'react-router-dom';
import utils from '../../../libs/utils';
import { AppPath } from '../../../routes/routes';
import styles from '../../assets/styles/pages/auth-screens.module.scss';
import InputField from '../../components/Input/InputField/InputField';
import { useSignUp } from '../../hooks/query/auth.hook';

const SignUp: FunctionComponent = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailInputError, setEmailInputError] = useState<string | undefined>();
  const [confirmPassInputError, setConfirmPassInputError] = useState<
    string | undefined
  >();

  const { mutate: signUp, error, isLoading } = useSignUp();

  const handleSignUp = () => {
    if (!utils.string.validEmail(email)) {
      setEmailInputError('Email is invalid.');
      return;
    }

    setEmailInputError(undefined);

    signUp({ firstName, lastName, email, password, confirmPassword });
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSignUp();
  };

  const _handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pass = e.target.value;
    setPassword(pass);
    setConfirmPassErrorOnCondition(
      !!confirmPassword && confirmPassword !== pass,
    );
  };

  const _handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const cPassword = e.target.value;
    setConfirmPassword(cPassword);
    setConfirmPassErrorOnCondition(cPassword !== password);
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
      <div className='flex flex-col items-center justify-center gap-4 self-stretch'>
        <span className='aucctus-header-sm-medium aucctus-text-brand-primary relative self-stretch'>
          Sign Up
        </span>
        <span className='aucctus-text-md aucctus-text-tertiary relative self-stretch'>
          After completing the form below, check your email for a confirmation
          link.
        </span>
        {error && (
          <div className={styles.error}>
            {utils.osiris.parseFormError(error)}
          </div>
        )}
      </div>
      <form className={styles.basicForm} onSubmit={handleFormSubmit}>
        <div className={styles.inputGroup}>
          <InputField
            name={'first name'}
            label={'First Name*'}
            autoComplete='on'
            value={firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFirstName(e.target.value)
            }
          />
          <InputField
            name={'last name'}
            label={'Last Name*'}
            autoComplete='on'
            value={lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setLastName(e.target.value)
            }
          />
        </div>
        <InputField
          name={'email'}
          label={'Email*'}
          autoComplete='on'
          errorMessage={emailInputError}
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          onFocus={() => setEmailInputError(undefined)}
        />
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
          errorMessage={confirmPassInputError}
          value={confirmPassword}
          onChange={_handleConfirmPasswordChange}
        />

        <button
          type='submit'
          className='btn btn-primary'
          disabled={
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !!emailInputError ||
            !!confirmPassInputError ||
            isLoading
          }
        >
          Sign Up
        </button>

        <div className={styles.signUp}>
          <span className='aucctus-text-tertiary aucctus-text-md'>
            Already have an account?
          </span>
          <Link
            className='aucctus-text-sm-medium btn btn-link !text-gray-light-700 hover:!text-primary-900'
            to={AppPath.Login}
          >
            Sign In
          </Link>
        </div>
      </form>
    </>
  );
};

export default SignUp;
