import TabView from '@components/Container/TabView';
import { TabElement } from '@components/Container/TabView/TabView';
import { Loading } from '@components';
import { useConceptCustomerProfiles } from '@hooks/query/concepts.hook';
import { ICustomerProfile } from '@libs/api/types';
import { AppPath } from '@routes/routes';
import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import CustomerDetails from './Details/CustomerDetails';
import styles from './customerProfile.module.scss';

const CustomerProfile: FunctionComponent = () => {
  const { id: conceptId } = useParams();
  const navigate = useNavigate();
  const { profiles, isLoading } = useConceptCustomerProfiles(conceptId || '');
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProfileName = searchParams.get('persona');
  const selectedProfile = useMemo(
    () => profiles.find((item) => item.nickname === selectedProfileName),
    [profiles, selectedProfileName],
  );

  const customerTabs = useMemo(() => {
    return profiles.map<TabElement>((item: ICustomerProfile) => ({
      label: item.nickname,
      value: item.nickname,
    }));
  }, [profiles]);

  const onTabSelect = useCallback(
    (value: string) => {
      setSearchParams((prev) => {
        prev.set('persona', value);
        return prev;
      });
    },
    [setSearchParams],
  );

  useEffect(() => {
    const firstPersona = profiles.length > 0 ? profiles[0] : undefined;
    if (
      (!selectedProfileName || !selectedProfile) &&
      conceptId &&
      firstPersona
    ) {
      navigate(
        {
          pathname: AppPath.ConceptCustomerProfile.replace(':id', conceptId),
          search: `?persona=${firstPersona.nickname}`,
        },
        {
          replace: true,
        },
      );
    }
  }, [
    selectedProfileName,
    onTabSelect,
    conceptId,
    navigate,
    profiles,
    selectedProfile,
  ]);
  if (isLoading) {
    return (
      <div className='flex h-full w-full flex-col gap-6'>
        <div className='flex h-full min-h-96 w-full items-center justify-center align-middle'>
          <Loading />
        </div>
      </div>
    );
  }

  // Handle case where loading is finished but no profiles exist
  if (!isLoading && profiles.length === 0) {
    return (
      <div className='aucctus-text-secondary flex h-full w-full flex-col items-center justify-center gap-6 p-8'>
        No customer profiles found for this concept.
        {/* Optionally add a button to create one? */}
      </div>
    );
  }

  return (
    <div className={styles.customerProfile}>
      <TabView
        tabs={customerTabs}
        tabGroupClassName='pointer-events-auto'
        className={styles.tabs}
        variant='button'
        onTabSelect={onTabSelect}
        activeTab={selectedProfileName || ''}
      >
        {selectedProfile ? (
          <CustomerDetails profile={selectedProfile} className='mt-4' />
        ) : // Render nothing if no profile is selected after loading
        null}
      </TabView>
    </div>
  );
};

export default CustomerProfile;
