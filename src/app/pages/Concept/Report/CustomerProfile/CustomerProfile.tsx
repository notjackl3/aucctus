import TabView from '@components/Container/TabView';
import { TabElement } from '@components/Container/TabView/TabView';
import { Loading, Icon } from '@components';
import { useConceptCustomerProfiles } from '@hooks/query/concepts.hook';
import { ICustomerProfile } from '@libs/api/types';
import { AppPath } from '@routes/routes';
import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CustomerDetails from './Details/CustomerDetails';
import useStore from '@stores/store';

const CustomerProfile: FunctionComponent = () => {
  const activeConceptIdentifier = useStore(
    (state) => state.conceptReport.identifier,
  );
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid,
  );
  const navigate = useNavigate();
  const { profiles, isLoading } = useConceptCustomerProfiles(
    activeConceptUuid || '',
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProfileName = searchParams.get('persona');
  const selectedProfile = useMemo(
    () => profiles.find((item) => item.segment === selectedProfileName),
    [profiles, selectedProfileName],
  );

  const customerTabs = useMemo(() => {
    return profiles.map<TabElement>((item: ICustomerProfile) => ({
      label: (
        <div className='flex items-center gap-2'>
          <span>{item.segment}</span>
          {item.isPrimary && (
            <span className='aucctus-bg-brand-secondary aucctus-text-brand-tertiary flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs'>
              <Icon
                variant='briefcase'
                height={14}
                width={14}
                className='aucctus-stroke-brand-primary'
              />
              Primary
            </span>
          )}
        </div>
      ),
      value: item.segment,
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
      activeConceptIdentifier &&
      firstPersona
    ) {
      navigate(
        {
          pathname: AppPath.ConceptCustomerProfile.replace(
            ':id',
            activeConceptIdentifier,
          ),
          search: `?persona=${firstPersona.segment}`,
        },
        {
          replace: true,
        },
      );
    }
  }, [
    selectedProfileName,
    onTabSelect,
    navigate,
    profiles,
    selectedProfile,
    activeConceptIdentifier,
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
    <div className='flex h-full w-full flex-col flex-wrap items-start self-stretch'>
      <TabView
        tabs={customerTabs}
        tabGroupClassName='pointer-events-auto flex flex-1'
        tabContainerClassName='flex flex-1 items-center justify-center'
        tabClassName='flex flex-1 aucctus-bg-primary-hover items-center justify-center'
        className='flex h-full w-full items-start justify-center'
        variant='button'
        onTabSelect={onTabSelect}
        activeTab={selectedProfileName || ''}
      >
        {selectedProfile && (
          <CustomerDetails profile={selectedProfile} className='mt-4' />
        )}
      </TabView>
    </div>
  );
};

export default CustomerProfile;
