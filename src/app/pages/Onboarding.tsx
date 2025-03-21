import { Input } from '@components';
import utils from '@libs/utils';
import { AppPath } from '@routes/routes';
import useStore from '@stores/store';
import { FunctionComponent, useCallback, useState } from 'react';
import { Navigate } from 'react-router-dom';
import styles from '../assets/styles/pages/auth-screens.module.scss';
import Footer from '../components/Auth/Footer/Footer';
import OnboardingIntoSection from '../components/Auth/OnboardingIntroSection';
import AuthHeader from '../components/Header/AuthHeader/AuthHeader';
import InputField from '../components/Input/InputField/InputField';
import { useRegisterAccount } from '../hooks/query/account.hook';

const GOAL_MAX_LENGTH = 500;

const OnBoarding: FunctionComponent = () => {
  const account = useStore((state) => state.auth.account);
  const user = useStore((state) => state.auth.user);
  const { mutate: registerAccount, isLoading } = useRegisterAccount();
  const [name, setName] = useState<string>('');
  const [domain, setDomain] = useState<string>('');
  const [innovationGoal, setGoal] = useState<string>('');
  const [goalInputError, setGoalInputError] = useState<string | undefined>(
    undefined,
  );

  const [domainInputError, setDomainInputError] = useState<
    string | undefined
  >();

  const _handleDomainValidation = useCallback(() => {
    const unwantedPrefix = ['https://', 'http://'];

    let d = domain;

    for (const prefix of unwantedPrefix) {
      if (d.substring(0, prefix.length) === prefix) {
        d = d.slice(prefix.length);
      }
    }

    if (d && !utils.string.validDomain(d)) {
      setDomainInputError('Enter a valid domain name.');
    } else {
      setDomainInputError(undefined);
    }

    setDomain(d);
  }, [domain]);

  if (user && account) {
    return <Navigate to={AppPath.Home} replace />;
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.formSection}>
        <AuthHeader />
        <div className={styles.form}>
          <div className={styles.header}>
            <span className={styles.title}>Welcome aboard!</span>
            <span className={styles.supportingText}>
              Answer the prompts below to start innovating
            </span>
          </div>
          <div className={styles.basicForm}>
            <InputField
              name={'companyName'}
              label={'Company Name'}
              value={name}
              placeholder='Acme Widgets Corp.'
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setName(e.target.value);
              }}
            />
            <InputField
              name={'companyUrl'}
              label={'Company URL'}
              error={!!domainInputError}
              errorMessage={domainInputError}
              value={domain}
              placeholder='www.acmewidgetscorp.com'
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setDomain(e.target.value);
              }}
              onFocus={() => setDomainInputError(undefined)}
              onBlur={_handleDomainValidation}
            />

            <Input.TextArea
              name={'innovationGoal'}
              label={
                'What is your organization looking to achieve through innovation?'
              }
              errorMessage={goalInputError}
              rows={2}
              value={innovationGoal}
              placeholder='Expand into new industries.'
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setGoal(e.target.value);
                if (e.target.value.length >= GOAL_MAX_LENGTH) {
                  setGoalInputError(
                    `Maximum character limit of ${GOAL_MAX_LENGTH} reached.`,
                  );
                } else {
                  setGoalInputError(undefined);
                }
              }}
              maxLength={1000}
              onFocus={() => setGoalInputError(undefined)}
            />

            <button
              type='button'
              className='btn btn-primary'
              onClick={() => {
                registerAccount({ name, domain, goal: innovationGoal });
              }}
              disabled={
                !name ||
                !domain ||
                !innovationGoal ||
                !!domainInputError ||
                !!goalInputError ||
                isLoading
              }
            >
              Complete
            </button>
          </div>
        </div>
        <Footer />
      </div>
      <OnboardingIntoSection />
    </div>
  );
};

export default OnBoarding;
