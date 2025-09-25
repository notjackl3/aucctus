import TabView from '@components/Container/TabView';
import { TabElement } from '@components/Container/TabView/TabView';
import { Loading, Icon, VersionUpgradeBanner, toast } from '@components';
import ExecutiveSummaryBanner from '@components/ConceptOverview/ExecutiveSummaryBanner';
import {
  useConceptCustomerProfiles,
  useGenerateCustomerProfile,
  useConceptExecutiveSummaries,
} from '@hooks/query/concepts.hook';
import { ICustomerProfile } from '@libs/api/types';
import { AppPath } from '@routes/routes';
import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CustomerDetails from './Details/CustomerDetails';
import useStore from '@stores/store';
import { useDebugMode } from '@hooks/debug-mode.hook';

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
  const { mutate: generateCustomerProfile, isLoading: isGenerating } =
    useGenerateCustomerProfile();
  const { executiveSummaries, isLoading: isExecutiveSummariesLoading } =
    useConceptExecutiveSummaries(activeConceptUuid || '');
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProfileName = searchParams.get('persona');
  const selectedProfile = useMemo(
    () => profiles.find((item) => item.segment === selectedProfileName),
    [profiles, selectedProfileName],
  );

  // Use global debug mode state
  const isDebugModeEnabled = useDebugMode();

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

  const handleDebugModeGenerate = () => {
    if (!activeConceptIdentifier) return;

    generateCustomerProfile(activeConceptIdentifier, {
      onSuccess: () => {
        toast.success(
          '👥 Customer Profile generated successfully!',
          undefined,
          {
            autoClose: 2000,
          },
        );
      },
      onError: () => {
        toast.error('❌ Failed to generate Customer Profile', undefined, {
          autoClose: 2000,
        });
      },
    });
  };

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
      <>
        {/* Show debug mode banner if debug mode is enabled */}
        {isDebugModeEnabled && (
          <VersionUpgradeBanner
            onUpgrade={handleDebugModeGenerate}
            isLoading={isGenerating}
            buttonText='Generate Section'
            debugMode={true}
          />
        )}

        <div className='flex h-full w-full flex-col'>
          <div className='aucctus-text-secondary flex h-full w-full flex-col items-center justify-center gap-6 p-8'>
            No customer profiles found for this concept.
            {/* Optionally add a button to create one? */}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Show debug mode banner if debug mode is enabled */}
      {isDebugModeEnabled && (
        <VersionUpgradeBanner
          onUpgrade={handleDebugModeGenerate}
          isLoading={isGenerating}
          buttonText='Generate Section'
          debugMode={true}
        />
      )}

      <div className='flex h-full w-full flex-col flex-wrap items-start self-stretch'>
        <div className='w-full'>
          <ExecutiveSummaryBanner
            summary={executiveSummaries?.customerProfiles}
            isLoading={isExecutiveSummariesLoading}
          />
        </div>
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
    </>
  );
};

export default CustomerProfile;
