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
  useConceptUpdate,
  useGenerateCustomerProfile,
} from '@hooks/query/concepts.hook';
import { usePersonas } from '@hooks/query/persona.hook';
import { ICustomerProfile } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import * as Popover from '@radix-ui/react-popover';
import { AppPath } from '@routes/routes';
import useStore from '@stores/store';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Sparkles, Trash2 } from 'lucide-react';
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
import DeleteCustomerProfileModal from './DeleteCustomerProfileModal';
import CustomerDetails from './Details/CustomerDetails';
import LivingPersonaProfile from './LivingPersonaProfile';

/** Prefix for living persona tabs in URL params (format: __living_persona__:<uuid>) */
const LIVING_PERSONA_PREFIX = '__living_persona__';
/** Legacy sentinel value — maps to the first tagged persona for backward compat */
const LIVING_PERSONA_TAB = '__living_persona__';

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

  const livingPersonas = concept?.livingPersonas || [];
  const livingPersonaUuids = useMemo(
    () => concept?.livingPersonaUuids || [],
    [concept?.livingPersonaUuids],
  );
  const hasLivingPersonas = livingPersonaUuids.length > 0;

  // --- Customer profile delete management ---
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<{
    uuid: string;
    name: string;
  } | null>(null);

  const handleDeleteProfile = useCallback((profile: ICustomerProfile) => {
    setProfileToDelete({ uuid: profile.uuid, name: profile.segment });
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    if (!profileToDelete) return;
    const remaining = profiles.filter((p) => p.uuid !== profileToDelete.uuid);
    if (remaining.length > 0) {
      // If deleted profile was selected, select next/previous
      if (selectedProfileName === profileToDelete.name) {
        const deletedIndex = profiles.findIndex(
          (p) => p.uuid === profileToDelete.uuid,
        );
        const nextProfile =
          deletedIndex < remaining.length
            ? remaining[deletedIndex]
            : remaining[remaining.length - 1];
        setSearchParams((prev) => {
          prev.set('persona', nextProfile.segment);
          return prev;
        });
      }
    }
    setProfileToDelete(null);
  }, [profileToDelete, profiles, selectedProfileName, setSearchParams]);

  const isLastProfile = profiles.length <= 1;

  // --- Living persona add/remove management ---
  const MAX_PERSONAS = 4;
  const { personas: allPersonas, isLoading: personasLoading } = usePersonas();
  const updateMutation = useConceptUpdate();
  const [addPopoverOpen, setAddPopoverOpen] = useState(false);

  const taggedUuids = useMemo(
    () => new Set(livingPersonaUuids),
    [livingPersonaUuids],
  );

  const availablePersonas = useMemo(() => {
    if (!allPersonas) return [];
    return allPersonas.filter((p) => !taggedUuids.has(p.uuid));
  }, [allPersonas, taggedUuids]);

  const atPersonaLimit = livingPersonaUuids.length >= MAX_PERSONAS;

  const handleAddPersona = useCallback(
    (personaUuid: string) => {
      if (atPersonaLimit) return;
      const newUuids = [...livingPersonaUuids, personaUuid];
      updateMutation.mutate({
        identifier: concept.identifier,
        livingPersonaUuids: newUuids,
      });
    },
    [atPersonaLimit, concept.identifier, livingPersonaUuids, updateMutation],
  );

  const handleRemovePersona = useCallback(
    (personaUuid: string) => {
      const newUuids = livingPersonaUuids.filter((u) => u !== personaUuid);
      updateMutation.mutate({
        identifier: concept.identifier,
        livingPersonaUuids: newUuids,
      });
    },
    [concept.identifier, livingPersonaUuids, updateMutation],
  );

  /** Check if the selected tab is any living persona */
  const isLivingPersonaSelected =
    selectedProfileName === LIVING_PERSONA_TAB ||
    (selectedProfileName?.startsWith(LIVING_PERSONA_PREFIX + ':') ?? false);

  /** Extract the selected living persona UUID from the tab key */
  const selectedLivingPersonaUuid = isLivingPersonaSelected
    ? selectedProfileName === LIVING_PERSONA_TAB
      ? livingPersonaUuids[0] // Legacy format — use first persona
      : selectedProfileName?.split(':')[1]
    : undefined;

  const { isSectionPending, hasBlockingLoad } = useUnifiedLoading({
    currentRoute: AppPath.ConceptCustomerProfile,
    concept,
    additionalLoadingStates: [
      isLoading || isFetchingProfiles,
      isExecutiveSummariesLoading || isExecutiveSummariesFetching,
    ],
  });

  const hasProfiles = profiles.length > 0;
  const hasContent = hasProfiles || hasLivingPersonas;
  const shouldShowSkeletons =
    isSectionPending || hasBlockingLoad || (isLoading && !hasContent);
  const hasSelectedProfile =
    Boolean(selectedProfile) || isLivingPersonaSelected;
  const canRenderDetails = hasContent && hasSelectedProfile;
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
    const activeKey = isLivingPersonaSelected
      ? selectedProfileName || LIVING_PERSONA_TAB
      : selectedProfile?.uuid;
    if (!activeKey) return;

    const activeEl = profileItemRefs.current.get(activeKey);
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
  }, [isLivingPersonaSelected, selectedProfile?.uuid, selectedProfileName]);

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
    // Determine the default tab: first living persona if tagged, otherwise first profile
    const defaultTab =
      livingPersonaUuids.length > 0
        ? `${LIVING_PERSONA_PREFIX}:${livingPersonaUuids[0]}`
        : firstPersona?.segment;

    const isValidSelection = isLivingPersonaSelected
      ? hasLivingPersonas
      : !!selectedProfile;

    if (
      (!selectedProfileName || !isValidSelection) &&
      activeConceptIdentifier &&
      defaultTab
    ) {
      navigate(
        {
          pathname: AppPath.ConceptCustomerProfile.replace(
            ':id',
            activeConceptIdentifier,
          ),
          search: `?persona=${defaultTab}`,
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
    livingPersonaUuids,
    hasLivingPersonas,
    isLivingPersonaSelected,
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

  // Handle case where loading is finished but no profiles and no living persona exist
  if (
    !shouldShowSkeletons &&
    !isLoading &&
    profiles.length === 0 &&
    !hasLivingPersonas
  ) {
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
                className='sticky w-full overflow-hidden'
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
                  className='sticky top-0 w-full overflow-hidden'
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
                  className='sticky top-0 w-full overflow-hidden'
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
                        {livingPersonas.length + profiles.length}
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
                        {livingPersonas.length + profiles.length}
                      </span>
                    </div>

                    {/* Profile list with sliding indicator */}
                    <div ref={sidebarContainerRef} className='relative'>
                      {(selectedProfile || isLivingPersonaSelected) && (
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
                        {/* Living Persona sidebar items */}
                        {livingPersonas.map((lp, lpIndex) => {
                          const tabKey = `${LIVING_PERSONA_PREFIX}:${livingPersonaUuids[lpIndex]}`;
                          const isActive =
                            selectedProfileName === tabKey ||
                            (selectedProfileName === LIVING_PERSONA_TAB &&
                              lpIndex === 0);
                          const avatarElement = lp.avatarUrl ? (
                            <div className='h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-purple-400/30'>
                              <img
                                src={lp.avatarUrl}
                                alt={lp.name}
                                className='h-full w-full rounded-lg object-cover'
                              />
                            </div>
                          ) : (
                            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-purple-500 text-xs font-bold text-white'>
                              <Sparkles size={16} />
                            </div>
                          );

                          const button = (
                            <div
                              ref={(el) => {
                                if (el) {
                                  profileItemRefs.current.set(tabKey, el);
                                } else {
                                  profileItemRefs.current.delete(tabKey);
                                }
                              }}
                              onClick={() => onProfileSelect(tabKey)}
                              className={cn(
                                'group/lp flex cursor-pointer items-center rounded-lg transition-colors',
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
                                    {lp.name || 'Living Persona'}
                                  </span>
                                </div>
                                <span className='aucctus-text-tertiary truncate whitespace-nowrap text-[10px] font-medium'>
                                  Living Persona
                                </span>
                              </div>
                              {/* Remove button - only when expanded and not read-only */}
                              {sidebarExpanded && !isReadOnly && (
                                <button
                                  type='button'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemovePersona(
                                      livingPersonaUuids[lpIndex],
                                    );
                                  }}
                                  className='aucctus-text-tertiary flex-shrink-0 rounded p-1 opacity-0 transition-all hover:text-red-500 group-hover/lp:opacity-100'
                                  aria-label={`Remove ${lp.name}`}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          );

                          if (!sidebarExpanded) {
                            return (
                              <ComponentTooltip
                                key={tabKey}
                                tip={lp.name || 'Living Persona'}
                              >
                                {button}
                              </ComponentTooltip>
                            );
                          }

                          return <div key={tabKey}>{button}</div>;
                        })}

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
                                'group/cp flex cursor-pointer items-center rounded-lg transition-colors',
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
                              {/* Delete button - only when expanded and not read-only */}
                              {sidebarExpanded &&
                                !isReadOnly &&
                                (isLastProfile ? (
                                  <ComponentTooltip tip='Cannot delete the last customer profile'>
                                    <button
                                      type='button'
                                      disabled
                                      className='aucctus-text-tertiary flex-shrink-0 cursor-not-allowed rounded p-1 opacity-50 group-hover/cp:opacity-50'
                                      aria-label='Cannot delete the last customer profile'
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </ComponentTooltip>
                                ) : (
                                  <button
                                    type='button'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteProfile(profile);
                                    }}
                                    className='aucctus-text-tertiary flex-shrink-0 rounded p-1 opacity-0 transition-all hover:text-red-500 group-hover/cp:opacity-100'
                                    aria-label={`Delete ${profile.segment}`}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                ))}
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

                        {/* Add living persona button */}
                        {!isReadOnly && !atPersonaLimit && (
                          <Popover.Root
                            open={addPopoverOpen}
                            onOpenChange={setAddPopoverOpen}
                          >
                            <Popover.Trigger asChild>
                              {sidebarExpanded ? (
                                <button
                                  type='button'
                                  className='aucctus-text-tertiary aucctus-bg-secondary-hover flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-xs transition-colors'
                                >
                                  <div className='aucctus-border-secondary flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-dashed'>
                                    <Plus
                                      size={16}
                                      className='aucctus-text-tertiary'
                                    />
                                  </div>
                                  <span
                                    className='aucctus-text-secondary whitespace-nowrap text-xs font-medium'
                                    style={{
                                      opacity: sidebarExpanded ? 1 : 0,
                                      transition: 'opacity 150ms ease-out',
                                    }}
                                  >
                                    Add Persona
                                  </span>
                                </button>
                              ) : (
                                <ComponentTooltip tip='Add Living Persona'>
                                  <button
                                    type='button'
                                    className='aucctus-text-tertiary aucctus-bg-secondary-hover flex w-full cursor-pointer justify-center rounded-lg p-[6px] transition-colors'
                                  >
                                    <div className='aucctus-border-secondary flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-dashed'>
                                      <Plus
                                        size={16}
                                        className='aucctus-text-tertiary'
                                      />
                                    </div>
                                  </button>
                                </ComponentTooltip>
                              )}
                            </Popover.Trigger>
                            <Popover.Portal>
                              <Popover.Content
                                side='right'
                                align='start'
                                sideOffset={8}
                                className='aucctus-bg-primary aucctus-border-secondary z-50 w-64 rounded-lg border shadow-lg'
                              >
                                <div className='aucctus-border-secondary border-b px-3 py-2'>
                                  <p className='aucctus-text-xs-medium aucctus-text-secondary'>
                                    Add Living Persona ({livingPersonas.length}/
                                    {MAX_PERSONAS})
                                  </p>
                                </div>
                                <div className='max-h-48 overflow-y-auto p-1'>
                                  {personasLoading ? (
                                    <p className='aucctus-text-tertiary px-3 py-2 text-xs'>
                                      Loading...
                                    </p>
                                  ) : availablePersonas.length === 0 ? (
                                    <p className='aucctus-text-tertiary px-3 py-2 text-xs'>
                                      No more personas available
                                    </p>
                                  ) : (
                                    availablePersonas.map((persona) => (
                                      <button
                                        key={persona.uuid}
                                        type='button'
                                        onClick={() => {
                                          handleAddPersona(persona.uuid);
                                          setAddPopoverOpen(false);
                                        }}
                                        className='aucctus-bg-secondary-hover flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors'
                                      >
                                        {persona.avatar ? (
                                          <img
                                            src={persona.avatar}
                                            alt={persona.name}
                                            className='h-6 w-6 flex-shrink-0 rounded-full object-cover'
                                          />
                                        ) : (
                                          <span
                                            className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white'
                                            style={{
                                              backgroundColor:
                                                persona.themeColor ??
                                                'hsl(270, 50%, 50%)',
                                            }}
                                          >
                                            {persona.name.charAt(0)}
                                          </span>
                                        )}
                                        <div className='min-w-0 flex-1'>
                                          <p className='aucctus-text-primary truncate text-xs font-medium'>
                                            {persona.name}
                                          </p>
                                          <p className='aucctus-text-tertiary truncate text-[10px]'>
                                            {persona.segment}
                                          </p>
                                        </div>
                                      </button>
                                    ))
                                  )}
                                </div>
                              </Popover.Content>
                            </Popover.Portal>
                          </Popover.Root>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassSurface>
              </div>
            )}

            {/* Main Content Area */}
            <div className='min-w-0 flex-1'>
              <AnimatePresence mode='wait'>
                {isLivingPersonaSelected && selectedLivingPersonaUuid ? (
                  <motion.div
                    key={`living-persona-${selectedLivingPersonaUuid}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LivingPersonaProfile
                      personaUuid={selectedLivingPersonaUuid}
                      isReadOnly={isReadOnly}
                    />
                  </motion.div>
                ) : selectedProfile ? (
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

      {profileToDelete && (
        <DeleteCustomerProfileModal
          profileUuid={profileToDelete.uuid}
          profileName={profileToDelete.name}
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onDeleted={handleDeleteSuccess}
        />
      )}
    </>
  );
};

export default CustomerProfile;
