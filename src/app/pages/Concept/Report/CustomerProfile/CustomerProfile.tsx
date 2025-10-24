import TabView from '@components/Container/TabView';
import { TabElement } from '@components/Container/TabView/TabView';
import {
  Icon,
  VersionUpgradeBanner,
  toast,
  ConceptReportSkeletons,
} from '@components';
import ExecutiveSummaryBanner from '@components/ConceptOverview/ExecutiveSummaryBanner';
import {
  useConceptCustomerProfiles,
  useGenerateCustomerProfile,
  useConceptExecutiveSummaries,
} from '@hooks/query/concepts.hook';
import { useUnifiedLoading } from '@hooks/concepts/unified-loading.hook';
import { ICustomerProfile } from '@libs/api/types';
import { AppPath } from '@routes/routes';
import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import {
  useNavigate,
  useOutletContext,
  useSearchParams,
} from 'react-router-dom';
import CustomerDetails from './Details/CustomerDetails';
import useStore from '@stores/store';
import { useDebugMode } from '@hooks/debug-mode.hook';
import { IConceptReportContext } from '../ConceptReport/ConceptReport';

const {
  ExecutiveSummarySkeleton,
  ProfileOverviewSkeleton,
  ProfileConversationSkeleton,
  JobsToBeDoneSkeleton,
  SkeletonBlock,
} = ConceptReportSkeletons;

const CustomerProfile: FunctionComponent = () => {
  const activeConceptIdentifier = useStore(
    (state) => state.conceptReport.identifier,
  );
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid,
  );
  const { concept } = useOutletContext<IConceptReportContext>();
  const navigate = useNavigate();
  const profilesQuery = useConceptCustomerProfiles(activeConceptUuid || '');
  const { profiles } = profilesQuery;
  const isLoading = profilesQuery.isLoading;
  const isFetchingProfiles = profilesQuery.isFetching;
  const { mutate: generateCustomerProfile, isLoading: isGenerating } =
    useGenerateCustomerProfile();
  const executiveSummariesQuery = useConceptExecutiveSummaries(
    activeConceptUuid || '',
  );
  const { executiveSummaries } = executiveSummariesQuery;
  const isExecutiveSummariesLoading = executiveSummariesQuery.isLoading;
  const isExecutiveSummariesFetching = executiveSummariesQuery.isFetching;
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProfileName = searchParams.get('persona');
  const selectedProfile = useMemo(
    () => profiles.find((item) => item.segment === selectedProfileName),
    [profiles, selectedProfileName],
  );

  const { isSectionPending, hasBlockingLoad } = useUnifiedLoading({
    currentRoute: AppPath.ConceptCustomerProfile,
    concept,
    additionalLoadingStates: [
      isLoading || isFetchingProfiles,
      isExecutiveSummariesLoading || isExecutiveSummariesFetching,
    ],
  });

  const hasProfiles = profiles.length > 0;
  const shouldShowSkeletons =
    isSectionPending || hasBlockingLoad || (isLoading && !hasProfiles);
  const hasSelectedProfile = Boolean(selectedProfile);
  const canRenderDetails = hasProfiles && hasSelectedProfile;
  const shouldRenderSkeletonWithoutData =
    shouldShowSkeletons && !canRenderDetails;
  const shouldRenderSkeletonWithData = shouldShowSkeletons && canRenderDetails;
  const renderSupportSkeletonCard = () => (
    <div className='aucctus-bg-primary aucctus-border-secondary flex flex-1 flex-col gap-3 rounded-lg border p-4 shadow-sm'>
      <SkeletonBlock className='h-5 w-40' />
      <SkeletonBlock className='h-3 w-28' />
      <SkeletonBlock className='h-4 w-full' />
      <SkeletonBlock className='h-4 w-3/4' />
      <SkeletonBlock className='h-4 w-2/3' />
    </div>
  );

  const renderSkeletonTabs = () => (
    <div className='flex w-full items-center justify-center gap-2 p-4'>
      <SkeletonBlock className='h-10 w-40 rounded-lg' />
      <SkeletonBlock className='h-10 w-40 rounded-lg' />
      <SkeletonBlock className='h-10 w-40 rounded-lg' />
    </div>
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
        toast.successAnimated(
          'Customer Profile Generated',
          '👥 Customer Profile generated successfully!',
        );
      },
      onError: () => {
        toast.errorAnimated(
          'Customer Profile Failed',
          '❌ Failed to generate Customer Profile',
        );
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

  // Handle case where loading is finished but no profiles exist
  if (!shouldShowSkeletons && !isLoading && profiles.length === 0) {
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
          {shouldShowSkeletons ? (
            <ExecutiveSummarySkeleton />
          ) : (
            <ExecutiveSummaryBanner
              summary={executiveSummaries?.customerProfiles}
              isLoading={false}
            />
          )}
        </div>

        {shouldRenderSkeletonWithoutData ? (
          <div className='mt-4 flex w-full flex-col gap-6'>
            {renderSkeletonTabs()}
            <div className='flex w-full flex-row gap-4'>
              <ProfileOverviewSkeleton />
              <ProfileConversationSkeleton />
            </div>
            <div className='flex w-full flex-row gap-4'>
              <JobsToBeDoneSkeleton />
              {renderSupportSkeletonCard()}
              {renderSupportSkeletonCard()}
            </div>
            {FEATURE_CUSTOMER_PROFILE_REAL_WORLD_SIGNALS && (
              <div className='flex w-full flex-row gap-4'>
                {renderSupportSkeletonCard()}
              </div>
            )}
          </div>
        ) : (
          <>
            {shouldRenderSkeletonWithData && renderSkeletonTabs()}
            {!shouldRenderSkeletonWithData && (
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
                  <CustomerDetails
                    profile={selectedProfile}
                    className='mt-4'
                    showSkeletons={shouldRenderSkeletonWithData}
                  />
                )}
              </TabView>
            )}
            {shouldRenderSkeletonWithData && (
              <div className='mt-4 flex w-full flex-col gap-6'>
                <div className='flex w-full flex-row gap-4'>
                  <ProfileOverviewSkeleton />
                  <ProfileConversationSkeleton />
                </div>
                <div className='flex w-full flex-row gap-4'>
                  <JobsToBeDoneSkeleton />
                  {renderSupportSkeletonCard()}
                  {renderSupportSkeletonCard()}
                </div>
                {FEATURE_CUSTOMER_PROFILE_REAL_WORLD_SIGNALS && (
                  <div className='flex w-full flex-row gap-4'>
                    {renderSupportSkeletonCard()}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default CustomerProfile;
