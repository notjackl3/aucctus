import utils from '@libs/utils';
import { AppPath } from '@routes/routes';
import { FunctionComponent, useCallback, useState } from 'react';
import { Navigate } from 'react-router-dom';
import styles from '../assets/styles/pages/auth-screens.module.scss';
import Footer from '../components/Auth/Footer/Footer';
import OnboardingIntoSection from '../components/Auth/OnboardingIntroSection';
import AuthHeader from '../components/Header/AuthHeader/AuthHeader';
import InputField from '../components/Input/InputField/InputField';
import { useRegisterAccount } from '../hooks/query/account.hook';
import { useAppStore } from '../stores/app.store';

const OnBoarding: FunctionComponent = () => {
  const { user } = useAppStore();
  const { mutate: registerAccount } = useRegisterAccount();
  const [name, setName] = useState<string>('');
  const [domain, setDomain] = useState<string>('');
  const [innovationGoal, setGoal] = useState<string>('');

  const [domainInputError, setDomainInputError] = useState<
    string | undefined
  >();

  const _handleDomainValidation = useCallback(
    (e: React.FocusEvent) => {
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
      e.preventDefault();
    },
    [domain],
  );

  if (user && user.account) {
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
                e.preventDefault();
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
                e.preventDefault();
              }}
              onFocus={() => setDomainInputError(undefined)}
              onBlur={_handleDomainValidation}
            />

            <InputField
              name={'innovationGoal'}
              label={
                'What is your organization looking to achieve through innovation?'
              }
              value={innovationGoal}
              placeholder='Expand into new industries.'
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setGoal(e.target.value);
                e.preventDefault();
              }}
            />

            <button
              type='button'
              className='btn btn-primary'
              onClick={(e) => {
                e.preventDefault();
                registerAccount({ name, domain, goal: innovationGoal });
              }}
              disabled={
                !name ||
                !domain ||
                !innovationGoal ||
                !!domainInputError ||
                status === 'loading'
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
