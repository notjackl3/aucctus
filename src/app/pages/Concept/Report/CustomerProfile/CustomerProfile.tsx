import {
  ComponentTooltip,
  ConceptReportSkeletons,
  GlassSurface,
  VersionUpgradeBanner,
  toast,
} from '@components';
import ExecutiveSummaryBanner from '@components/ConceptOverview/ExecutiveSummaryBanner';
import { useUnifiedLoading } from '@hooks/concepts/unified-loading.hook';
import { useDebugMode } from '@hooks/debug-mode.hook';
import {
  useConceptCustomerProfiles,
  useConceptExecutiveSummaries,
  useGenerateCustomerProfile,
} from '@hooks/query/concepts.hook';
import { ICustomerProfile } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { AppPath } from '@routes/routes';
import useStore from '@stores/store';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useConceptReportContext } from '../ConceptReport/ConceptReportContext';
import CustomerDetails from './Details/CustomerDetails';

const {
  ExecutiveSummarySkeleton,
  ProfileOverviewSkeleton,
  ProfileConversationSkeleton,
  JobsToBeDoneSkeleton,
  SkeletonBlock,
} = ConceptReportSkeletons;

/** Sidebar width constants - matching Living Personas pattern */
const SIDEBAR_COLLAPSED = 68;
const SIDEBAR_EXPANDED = 240;

/** Generate initials from a name */
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const CustomerProfile: FunctionComponent = () => {
  const activeConceptIdentifier = useStore(
    (state) => state.conceptReport.identifier,
  );
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid,
  );

  const { concept, isReadOnly } = useConceptReportContext();
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
    () =>
      profiles.find((item) => item.segment === selectedProfileName) ||
      (profiles.length > 0 ? profiles[0] : undefined),
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

  // Sidebar state - matching Living Personas pattern
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const sidebarContainerRef = useRef<HTMLDivElement>(null);
  const profileItemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({
    top: 0,
    height: 0,
    width: 0,
    left: 0,
  });

  // Sliding indicator calculation - matching Living Personas pattern
  const recalcIndicator = useCallback(() => {
    if (!selectedProfile?.uuid) return;

    const activeEl = profileItemRefs.current.get(selectedProfile.uuid);
    const containerEl = sidebarContainerRef.current;

    if (!activeEl || !containerEl) return;

    const containerRect = containerEl.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();

    const next = {
      top: activeRect.top - containerRect.top,
      height: activeRect.height,
      width: activeRect.width,
      left: activeRect.left - containerRect.left,
    };

    setIndicatorStyle((prev) => {
      if (
        prev.top === next.top &&
        prev.height === next.height &&
        prev.width === next.width &&
        prev.left === next.left
      ) {
        return prev;
      }
      return next;
    });
  }, [selectedProfile?.uuid]);

  useLayoutEffect(() => {
    recalcIndicator();
  }, [recalcIndicator, sidebarExpanded]);

  useEffect(() => {
    const t = window.setTimeout(() => recalcIndicator(), 240);
    return () => window.clearTimeout(t);
  }, [selectedProfile?.uuid, sidebarExpanded, recalcIndicator]);

  useEffect(() => {
    const onResize = () => recalcIndicator();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [recalcIndicator]);

  const isDebugModeEnabled = useDebugMode();

  const renderSupportSkeletonCard = () => (
    <div className='aucctus-bg-primary aucctus-border-secondary flex flex-1 flex-col gap-3 rounded-lg border p-4 shadow-sm'>
      <SkeletonBlock className='h-5 w-40' />
      <SkeletonBlock className='h-3 w-28' />
      <SkeletonBlock className='h-4 w-full' />
      <SkeletonBlock className='h-4 w-3/4' />
      <SkeletonBlock className='h-4 w-2/3' />
    </div>
  );

  const onProfileSelect = useCallback(
    (segment: string) => {
      setSearchParams((prev) => {
        prev.set('persona', segment);
        return prev;
      });
    },
    [setSearchParams],
  );

  const handleDebugModeGenerate = () => {
    if (!activeConceptIdentifier) return;

    generateCustomerProfile(activeConceptIdentifier, {
      onError: () => {
        toast.error(
          'Customer Profile Failed',
          'Failed to generate Customer Profile',
        );
      },
    });
  };

  useEffect(() => {
    if (isReadOnly) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedProfileName,
    navigate,
    profiles,
    selectedProfile,
    activeConceptIdentifier,
    isReadOnly,
  ]);

  const featureVersion =
    (concept.featureVersions as Record<string, string> | undefined)
      ?.customer_profiles ||
    concept.featureVersions?.customerProfiles ||
    'v2';

  const shouldShowUpgradeBanner =
    featureVersion === 'v1' &&
    !isSectionPending &&
    !hasBlockingLoad &&
    !isGenerating;

  // No profiles found
  if (!shouldShowSkeletons && !isLoading && profiles.length === 0) {
    return (
      <>
        {!isReadOnly && isDebugModeEnabled && (
          <VersionUpgradeBanner
            onUpgrade={handleDebugModeGenerate}
            isLoading={isGenerating}
            buttonText='Generate Section'
            debugMode={true}
          />
        )}
        {!isReadOnly && shouldShowUpgradeBanner && (
          <VersionUpgradeBanner
            onUpgrade={handleDebugModeGenerate}
            isLoading={isGenerating}
            featureName='customerProfiles'
            title='Upgrade Customer Profiles'
            description={
              <>
                Upgrading will review your existing profiles and preserve them
                where possible. Profiles may be added, updated, or removed if
                new evidence warrants it. Tests linked to removed profiles will
                be flagged for review.
              </>
            }
          />
        )}
        <div className='flex h-full w-full flex-col'>
          <div className='aucctus-text-secondary flex h-full w-full flex-col items-center justify-center gap-6 p-8'>
            No customer profiles found for this concept.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {!isReadOnly && isDebugModeEnabled && (
        <VersionUpgradeBanner
          onUpgrade={handleDebugModeGenerate}
          isLoading={isGenerating}
          buttonText='Generate Section'
          debugMode={true}
        />
      )}
      {!isReadOnly && shouldShowUpgradeBanner && (
        <VersionUpgradeBanner
          onUpgrade={handleDebugModeGenerate}
          isLoading={isGenerating}
          featureName='customerProfiles'
          title='Upgrade Customer Profiles'
          description={
            <>
              Upgrading will review your existing profiles and preserve them
              where possible. Profiles may be added, updated, or removed if new
              evidence warrants it. Tests linked to removed profiles will be
              flagged for review.
            </>
          }
        />
      )}

      <div className='flex h-full w-full flex-col flex-wrap items-start self-stretch'>
        {/* Executive Summary Banner */}
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
          <div className='mt-4 flex w-full gap-4'>
            {/* Sidebar skeleton */}
            <div className='flex-shrink-0' style={{ width: SIDEBAR_COLLAPSED }}>
              <GlassSurface
                className='sticky top-6 w-full overflow-hidden'
                variant='default'
              >
                <div className='p-[6px]'>
                  <div className='mb-2 flex justify-center'>
                    <SkeletonBlock className='h-5 w-8 rounded-full' />
                  </div>
                  <div className='flex flex-col gap-1'>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className='flex justify-center p-[6px]'>
                        <SkeletonBlock className='h-11 w-11 rounded-lg' />
                      </div>
                    ))}
                  </div>
                </div>
              </GlassSurface>
            </div>
            {/* Main content skeletons */}
            <div className='flex min-w-0 flex-1 flex-col gap-6'>
              <div className='flex w-full flex-row gap-4'>
                <ProfileOverviewSkeleton />
                <ProfileConversationSkeleton />
              </div>
              <div className='flex w-full flex-row gap-4'>
                <JobsToBeDoneSkeleton />
                {renderSupportSkeletonCard()}
                {renderSupportSkeletonCard()}
              </div>
            </div>
          </div>
        ) : (
          <div className='mt-4 flex w-full gap-4'>
            {/* Sidebar - skeleton or interactive */}
            {shouldRenderSkeletonWithData ? (
              <div
                className='flex-shrink-0'
                style={{ width: SIDEBAR_COLLAPSED }}
              >
                <GlassSurface
                  className='sticky top-6 w-full overflow-hidden'
                  variant='default'
                >
                  <div className='p-[6px]'>
                    <div className='mb-2 flex justify-center'>
                      <SkeletonBlock className='h-5 w-8 rounded-full' />
                    </div>
                    <div className='flex flex-col gap-1'>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className='flex justify-center p-[6px]'>
                          <SkeletonBlock className='h-11 w-11 rounded-lg' />
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassSurface>
              </div>
            ) : (
              <div
                className='flex-shrink-0 transition-all duration-200 ease-in-out'
                style={{
                  width: sidebarExpanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED,
                }}
                onMouseEnter={() => setSidebarExpanded(true)}
                onMouseLeave={() => setSidebarExpanded(false)}
                onTransitionEnd={(e) => {
                  if (e.propertyName === 'width') recalcIndicator();
                }}
              >
                <GlassSurface
                  as='nav'
                  className='sticky top-6 w-full overflow-hidden'
                  variant='default'
                >
                  <div
                    className='transition-[padding]'
                    style={{
                      padding: sidebarExpanded ? '12px' : '6px',
                      transitionDuration: '200ms',
                      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {/* Expanded header */}
                    <div
                      className='mb-3 flex items-center justify-between'
                      style={{
                        opacity: sidebarExpanded ? 1 : 0,
                        height: sidebarExpanded ? 'auto' : 0,
                        overflow: 'hidden',
                        transition:
                          'opacity 150ms ease-out, height 200ms ease-out',
                      }}
                    >
                      <span className='aucctus-text-xs-medium aucctus-text-tertiary whitespace-nowrap uppercase tracking-wide'>
                        Segments
                      </span>
                      <span className='aucctus-text-xs aucctus-text-tertiary aucctus-border-secondary rounded-full border px-1.5 py-0.5 text-[10px]'>
                        {profiles.length}
                      </span>
                    </div>

                    {/* Collapsed header */}
                    <div
                      className='mb-2 flex justify-center'
                      style={{
                        opacity: sidebarExpanded ? 0 : 1,
                        height: sidebarExpanded ? 0 : 'auto',
                        overflow: 'hidden',
                        transition:
                          'opacity 150ms ease-out, height 200ms ease-out',
                      }}
                    >
                      <span className='aucctus-text-xs aucctus-text-tertiary aucctus-border-secondary rounded-full border px-1.5 py-0.5 text-[10px]'>
                        {profiles.length}
                      </span>
                    </div>

                    {/* Profile list with sliding indicator */}
                    <div ref={sidebarContainerRef} className='relative'>
                      {selectedProfile && (
                        <motion.div
                          className='aucctus-border-primary aucctus-bg-secondary pointer-events-none absolute z-0 rounded-lg border'
                          initial={false}
                          animate={{
                            top: indicatorStyle.top,
                            height: indicatorStyle.height,
                            width: indicatorStyle.width,
                            left: indicatorStyle.left,
                          }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 35,
                          }}
                        />
                      )}

                      <div className='relative z-10 flex flex-col gap-1'>
                        {profiles.map((profile: ICustomerProfile) => {
                          const isActive =
                            profile.segment === selectedProfileName;

                          const avatarElement = profile.avatarUrl ? (
                            <div className='aucctus-border-secondary h-11 w-11 shrink-0 overflow-hidden rounded-lg border'>
                              <img
                                src={profile.avatarUrl}
                                alt={profile.segment}
                                className='h-full w-full rounded-lg object-cover'
                              />
                            </div>
                          ) : (
                            <div
                              className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white'
                              style={{
                                backgroundColor: '#6366F1',
                              }}
                            >
                              {getInitials(profile.segment)}
                            </div>
                          );

                          const button = (
                            <div
                              ref={(el) => {
                                if (el) {
                                  profileItemRefs.current.set(profile.uuid, el);
                                } else {
                                  profileItemRefs.current.delete(profile.uuid);
                                }
                              }}
                              onClick={() => onProfileSelect(profile.segment)}
                              className={cn(
                                'flex cursor-pointer items-center rounded-lg transition-colors',
                                isActive
                                  ? 'aucctus-text-brand-primary'
                                  : 'aucctus-text-tertiary aucctus-bg-secondary-hover hover:aucctus-text-secondary',
                              )}
                              style={{
                                padding: sidebarExpanded ? '6px 8px' : '6px',
                                justifyContent: sidebarExpanded
                                  ? 'flex-start'
                                  : 'center',
                                gap: sidebarExpanded ? '10px' : '0',
                              }}
                            >
                              {avatarElement}
                              <div
                                className='flex min-w-0 flex-1 flex-col'
                                style={{
                                  opacity: sidebarExpanded ? 1 : 0,
                                  width: sidebarExpanded ? 'auto' : 0,
                                  overflow: 'hidden',
                                  transition: 'opacity 150ms ease-out',
                                }}
                              >
                                <div className='flex items-center gap-1.5'>
                                  <span className='aucctus-text-sm-bold aucctus-text-primary truncate whitespace-nowrap'>
                                    {profile.segment}
                                  </span>
                                  {profile.isPrimary && (
                                    <span className='bg-primary/10 text-primary/80 flex-shrink-0 rounded-full px-1 py-0 text-[0.55rem]'>
                                      Primary
                                    </span>
                                  )}
                                </div>
                                <span className='aucctus-text-xs aucctus-text-tertiary truncate whitespace-nowrap'>
                                  {profile.name}
                                </span>
                              </div>
                            </div>
                          );

                          if (!sidebarExpanded) {
                            return (
                              <ComponentTooltip
                                key={profile.uuid}
                                tip={profile.segment}
                              >
                                {button}
                              </ComponentTooltip>
                            );
                          }

                          return <div key={profile.uuid}>{button}</div>;
                        })}
                      </div>
                    </div>
                  </div>
                </GlassSurface>
              </div>
            )}

            {/* Main Content Area */}
            <div className='min-w-0 flex-1'>
              <AnimatePresence mode='wait'>
                {selectedProfile ? (
                  <motion.div
                    key={selectedProfile.uuid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CustomerDetails
                      profile={selectedProfile}
                      showSkeletons={shouldRenderSkeletonWithData}
                      featureVersion={featureVersion}
                      isReadOnly={isReadOnly}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='aucctus-bg-secondary flex h-64 items-center justify-center rounded-xl'
                  >
                    <p className='aucctus-text-md aucctus-text-tertiary'>
                      Select a customer profile to view details
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

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
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CustomerProfile;
