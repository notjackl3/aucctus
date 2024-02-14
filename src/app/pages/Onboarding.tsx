import { FunctionComponent, useCallback, useState } from 'react';
import Footer from '../components/Footer';
import AuthHeader from '../components/AuthHeader';
import OnboardingIntoSection from '../components/OnboardingIntroSection';

import styles from '../assets/styles/pages/auth-screens.module.scss';
import { useAppDispatch } from '../hooks';
import InputField from '../components/InputField';
import { validDomain } from '../../libs/utils';
import { registerAccount, selectAuthStatus, selectUser } from '../../features/auth/auth.slice';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { AppPath } from '../../routes/routes';

const OnBoarding: FunctionComponent = () => {
  const user = useSelector(selectUser)!;
  const dispatch = useAppDispatch();
  const [name, setName] = useState<string>('');
  const [domain, setDomain] = useState<string>('');
  const status = useSelector(selectAuthStatus);

  const [domainInputError, setDomainInputError] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>(); //TODO: error handling

  const _handleDomainValidation = useCallback(
    (e: React.FocusEvent) => {
      const unwantedPrefix = ['https://', 'http://'];

      let d = domain;

      for (const prefix of unwantedPrefix) {
        if (d.substring(0, prefix.length) === prefix) {
          d = d.slice(prefix.length);
        }
      }

      if (d && !validDomain(d)) {
        setDomainInputError('Enter a valid domain name.');
      } else {
        setDomainInputError(undefined);
      }

      setDomain(d);
    },
    [domain]
  );

  const _handleRegistration = () => {
    dispatch(registerAccount({ name, domain }));
  };

  if (user.account) {
    return <Navigate to={AppPath.Home} />;
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.formSection}>
        <AuthHeader />
        <div className={styles.form}>
          <div className={styles.header}>
            <span className={styles.title}>Welcome aboard!</span>
            <span className={styles.supportingText}>Answer the prompts below to start innovating</span>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.basicForm}>
            <InputField
              name={'companyName'}
              label={'Company Name'}
              value={name}
              placeholder="Acme Widgets Corp."
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />
            <InputField
              name={'companyUrl'}
              label={'Company Url'}
              error={!!domainInputError}
              errorMessage={domainInputError}
              value={domain}
              placeholder="www.acmewidgetscorp.com"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDomain(e.target.value)}
              onFocus={() => setDomainInputError(undefined)}
              onBlur={_handleDomainValidation}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={_handleRegistration}
              disabled={!name || !domain || !!domainInputError || status === 'loading'}
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
