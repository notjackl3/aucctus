import { Input } from '@components';
import utils from '@libs/utils';
import { AppPath } from '@routes/routes';
import useStore, { resetAllStoreData } from '@stores/store';
import { FunctionComponent, useCallback, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Footer from '../components/Auth/Footer/Footer';
import OnboardingIntoSection from '../components/Auth/OnboardingIntroSection';
import { Header } from '@components';
// InputField will be accessed via Input.Field from @components
import { useRegisterAccount } from '../hooks/query/account.hook';
import { useAuth } from '@clerk/clerk-react';

const GOAL_MAX_LENGTH = 1000;

const OnBoarding: FunctionComponent = () => {
  const account = useStore((state) => state.auth.account);
  const user = useStore((state) => state.auth.user);
  const { mutate: registerAccount, isLoading } = useRegisterAccount();
  const { signOut } = useAuth();
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
    <div className='aucctus-bg-primary grid min-h-screen grid-cols-1 md:grid-cols-2'>
      {/* Left: Form Section */}
      <div className='flex flex-col justify-between p-6 md:p-12'>
        <Header.Auth />

        <div className='flex flex-col gap-8'>
          <div className='mb-2'>
            <span className='aucctus-header-sm-medium aucctus-text-brand-primary block'>
              Welcome aboard!
            </span>
            <span className='aucctus-text-md aucctus-text-tertiary block'>
              Answer the prompts below to start innovating
            </span>
          </div>

          <div className='aucctus-text-sm-medium flex flex-col items-stretch gap-8'>
            <Input.Field
              name={'companyName'}
              label={'Company Name'}
              value={name}
              placeholder='Acme Widgets Corp.'
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setName(e.target.value);
              }}
            />

            <Input.Field
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
              maxLength={GOAL_MAX_LENGTH}
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

            <div className='flex flex-row items-center justify-between px-1'>
              <span className='aucctus-text-tertiary aucctus-text-md'>
                Need to use a different account?
              </span>
              <Link
                className='btn btn-link !text-gray-light-700 hover:!text-primary-900'
                to={AppPath.Login}
                onClick={() =>
                  signOut().then(() => {
                    resetAllStoreData();
                  })
                }
              >
                Sign out
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* Right: Intro Section */}
      <div className='aucctus-bg-secondary hidden md:block'>
        <OnboardingIntoSection />
      </div>
    </div>
  );
};

export default OnBoarding;
