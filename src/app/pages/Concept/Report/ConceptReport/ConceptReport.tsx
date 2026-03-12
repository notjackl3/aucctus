import { ConceptReportSkeletons, Loading, Modal, toast } from '@components';
import ConceptVersionsDropdown from '@components/Button/Dropdown/ConceptVersionsDropdown';
import LoadingMask from '@components/Card/ConceptGeneration/UserExploration/components/util/LoadingMask';
import ConceptHero from '@components/ConceptReport/ConceptHero';
import type { ConceptTab } from '@components/ConceptReport/ConceptNavigation';
import ConceptNavigation from '@components/ConceptReport/ConceptNavigation';
import StickyConceptNav from '@components/ConceptReport/StickyConceptNav';
import { useModal } from '@context/ModalContextProvider';
import { useEditConcept } from '@hooks/concepts/editable.hook';
import { useAccountBranding } from '@hooks/query/accountBranding.hook';
import {
  useCancelConceptVersionRevert,
  useCommitConceptVersionRevert,
  useConcept,
  useConceptOverview,
  useTrackConceptView,
  useUpdateConceptImageSettings,
  useUploadConceptCustomImage,
} from '@hooks/query/concepts.hook';
import { useRoutePattern } from '@hooks/router.hook';
import { hexToHsla } from '@libs/utils/color';
import { cn } from '@libs/utils/react';
import { AppPath } from '@routes/routes';
import useStore from '@stores/store';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  ClockArrowDown,
  DollarSign,
  FlaskConical,
  Globe,
  Settings,
  Share2,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
import {
  ConceptReportContext,
  type IConceptReportContext,
} from './ConceptReportContext';
import ConceptReportSocketWrapper from './ConceptReportSocketWrapper';
import ShareReportDialog from './ShareReportDialog';

const { SkeletonBlock } = ConceptReportSkeletons;

export type { IConceptReportContext };

type TabKey =
  | 'OVERVIEW'
  | 'TRENDS'
  | 'ECOSYSTEM'
  | 'FINANCIAL'
  | 'CUSTOMERS'
  | 'ASSUMPTIONS'
  | 'TESTING';

// Map tab labels to section keys in reportStatusBySection
const TAB_TO_SECTION_MAP: Partial<Record<TabKey, string>> = {
  OVERVIEW: 'overview',
  TRENDS: 'trends',
  ECOSYSTEM: 'ecosystem',
  FINANCIAL: 'financialProjection',
  CUSTOMERS: 'customerProfiles',
  ASSUMPTIONS: 'assumptions',
};

// Base tabs with icons
const CONCEPT_TABS: {
  label: string;
  value: AppPath;
  icon: React.FC<{ className?: string }>;
  tabKey?: TabKey;
}[] = [
  {
    label: 'OVERVIEW',
    value: AppPath.ConceptOverview,
    icon: BarChart3,
    tabKey: 'OVERVIEW',
  },
  {
    label: 'TRENDS',
    value: AppPath.ConceptTrends,
    icon: TrendingUp,
    tabKey: 'TRENDS',
  },
  {
    label: 'ECOSYSTEM',
    value: AppPath.ConceptEcosystem,
    icon: Globe,
    tabKey: 'ECOSYSTEM',
  },
  {
    label: 'FINANCIAL',
    value: AppPath.ConceptFinancialProjection,
    icon: DollarSign,
    tabKey: 'FINANCIAL',
  },
  {
    label: 'CUSTOMERS',
    value: AppPath.ConceptCustomerProfile,
    icon: Users,
    tabKey: 'CUSTOMERS',
  },
  {
    label: 'ASSUMPTIONS',
    value: AppPath.ConceptKeyAssumptions,
    icon: BookOpen,
    tabKey: 'ASSUMPTIONS',
  },
];

interface ConceptReportProps {
  isReadOnly?: boolean;
}

const ConceptReport: FunctionComponent<ConceptReportProps> = ({
  isReadOnly = false,
}) => {
  const { id: conceptIdentifier } = useParams();
  const navigate = useNavigate();
  const activeTab = useRoutePattern();
  const { title: titleEdit } = useEditConcept();
  const { mutate: trackConceptView } = useTrackConceptView();
  const hasTrackedView = useRef(false);
  const navSentinelRef = useRef<HTMLDivElement>(null);

  const [showVersions, setShowVersions] = useState(false);
  const [versionsDropdownPos, setVersionsDropdownPos] = useState({
    top: 0,
    right: 0,
  });
  const [showShareDialog, setShowShareDialog] = useState(false);
  const versionsRef = useRef<HTMLDivElement>(null);
  const versionsHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { branding } = useAccountBranding();

  const navBrandStyles = useMemo(() => {
    const colors = branding?.colors;
    if (!colors || Object.keys(colors).length === 0) return undefined;
    const values = Object.values(colors);
    return {
      '--nav-brand-1': values[0] ? hexToHsla(values[0], 0.35) : undefined,
      '--nav-brand-2': values[1] ? hexToHsla(values[1], 0.3) : undefined,
      '--nav-brand-3': values[2] ? hexToHsla(values[2], 0.3) : undefined,
      '--nav-brand-4': values[3] ? hexToHsla(values[3], 0.25) : undefined,
    } as React.CSSProperties;
  }, [branding?.colors]);

  const {
    concept,
    isLoading: isConceptLoading,
    isFetching: isConceptFetching,
  } = useConcept(conceptIdentifier);
  const conceptUuid = useMemo(() => concept?.uuid || '', [concept]);
  const { openModal, closeModal } = useModal();

  // Fetch concept overview for the hero image and description
  const { conceptOverview } = useConceptOverview(conceptUuid || undefined);

  // Image upload mutations
  const uploadMutation = useUploadConceptCustomImage(conceptUuid);
  const updateSettings = useUpdateConceptImageSettings(conceptUuid);

  const setActiveConcept = useStore(
    (state) => state.conceptReport.setActiveConcept,
  );
  const setConceptUuid = useStore(
    (state) => state.conceptReport.setConceptUuid,
  );
  const { mutate: commitConceptVersionRevert, isLoading: isReverting } =
    useCommitConceptVersionRevert();
  const { mutate: cancelConceptVersionRevert, isLoading: isCancelling } =
    useCancelConceptVersionRevert();

  const handleRevertToAI = useCallback(() => {
    updateSettings.mutate({
      useCustomImage: false,
      customImageUrl: undefined,
    });
  }, [updateSettings]);

  // Resolve concept image
  const conceptImageUrl = useMemo(() => {
    if (conceptOverview?.useCustomImage && conceptOverview?.customImageUrl) {
      return conceptOverview.customImageUrl;
    }
    return conceptOverview?.conceptImageUrl || concept?.conceptImageUrl;
  }, [conceptOverview, concept]);

  // Preload hero image so the browser fetches it before ConceptHero mounts
  useEffect(() => {
    if (!conceptImageUrl) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = conceptImageUrl;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [conceptImageUrl]);

  // Hero description
  const heroDescription = useMemo(
    () => conceptOverview?.whatIsThis || concept?.summary || '',
    [conceptOverview, concept],
  );

  // Build tabs dynamically
  const conceptTabs = useMemo(() => {
    const tabs: {
      label: string;
      value: string;
      icon: React.FC<{ className?: string }>;
      tabKey?: TabKey;
      onAction?: (e: React.MouseEvent) => void;
    }[] = [...CONCEPT_TABS];

    // Add Testing tab if concept has assumptions v2
    if (concept?.featureVersions?.assumptions === 'v2') {
      tabs.push({
        label: 'TESTING',
        value: AppPath.ConceptTesting,
        icon: FlaskConical,
        tabKey: 'TESTING',
      });
    }

    // Add Versioning tab (icon only) if feature enabled and not historical
    if (FEATURE_CONCEPT_VERSIONING && !concept?.isHistoricalVersion) {
      tabs.push({
        label: '',
        value: 'versions',
        icon: ClockArrowDown,
        onAction: (e: React.MouseEvent) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setVersionsDropdownPos({
            top: rect.bottom + 10,
            right: window.innerWidth - rect.right,
          });
          setShowVersions((v) => !v);
        },
      });
    }

    // Add Share tab (icon only)
    tabs.push({
      label: '',
      value: 'share',
      icon: Share2,
      onAction: () => setShowShareDialog(true),
    });

    // Add Settings tab (icon only, no label) if concept has seed
    if (concept?.hasSeed) {
      tabs.push({
        label: '',
        value: AppPath.ConceptSettings,
        icon: Settings,
      });
    }

    // Add isLoading state based on section status
    return tabs.map((tab) => {
      const sectionKey = tab.tabKey
        ? TAB_TO_SECTION_MAP[tab.tabKey]
        : undefined;
      const sectionStatus = sectionKey
        ? concept?.reportStatusBySection?.[sectionKey]?.status
        : undefined;
      const isLoading = sectionStatus === 'pending';

      return {
        ...tab,
        isLoading,
      } as ConceptTab;
    });
  }, [
    concept?.featureVersions?.assumptions,
    concept?.hasSeed,
    concept?.isHistoricalVersion,
    concept?.reportStatusBySection,
  ]);

  useEffect(() => {
    if (concept) {
      setActiveConcept(concept);
    }
  }, [concept, setActiveConcept]);

  useEffect(() => {
    return () => {
      setConceptUuid(undefined);
    };
  }, [setConceptUuid]);

  useEffect(() => {
    if (conceptUuid && !hasTrackedView.current) {
      trackConceptView(conceptUuid);
      hasTrackedView.current = true;
    }
  }, [conceptUuid, trackConceptView]);

  const onTabSelect = useCallback(
    (value: string) => {
      if (conceptIdentifier === undefined) return;
      const route = value.replace(':id', conceptIdentifier);
      navigate(route);
    },
    [conceptIdentifier, navigate],
  );

  // Close versions dropdown on click outside
  useEffect(() => {
    if (!showVersions) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        versionsRef.current &&
        !versionsRef.current.contains(event.target as Node)
      ) {
        setShowVersions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showVersions]);

  // Auto-hide versions dropdown after 3s of mouse not hovering
  const startVersionsHideTimer = useCallback(() => {
    versionsHideTimer.current = setTimeout(() => setShowVersions(false), 2000);
  }, []);

  const clearVersionsHideTimer = useCallback(() => {
    if (versionsHideTimer.current) {
      clearTimeout(versionsHideTimer.current);
      versionsHideTimer.current = null;
    }
  }, []);

  // Start timer when dropdown opens, clean up on unmount/close
  useEffect(() => {
    if (showVersions) {
      startVersionsHideTimer();
    } else {
      clearVersionsHideTimer();
    }
    return clearVersionsHideTimer;
  }, [showVersions, startVersionsHideTimer, clearVersionsHideTimer]);

  // Show toast and redirect if concept not found
  const shouldRedirect = !concept && !isConceptLoading && !isConceptFetching;
  useEffect(() => {
    if (shouldRedirect) {
      toast.error('Concept Not Found', 'Concept Not Found');
    }
  }, [shouldRedirect]);

  if (shouldRedirect) {
    return <Navigate to={AppPath.ConceptBank} />;
  }

  return (
    <>
      <ConceptReportSocketWrapper />
      <ShareReportDialog
        conceptIdentifier={conceptIdentifier}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />
      <div
        className={cn('mx-auto my-0 flex min-h-full w-full flex-col p-8')}
        style={navBrandStyles}
      >
        {/* Hero Section */}
        {isConceptLoading || isConceptFetching ? (
          <div className='mb-8 flex flex-col gap-6'>
            <div className='aucctus-bg-secondary flex h-[280px] animate-pulse items-center justify-center rounded-xl'>
              <SkeletonBlock className='h-40 w-80' />
            </div>
            <SkeletonBlock className='h-12 w-full rounded-lg' />
          </div>
        ) : (
          <>
            <div className='mb-8'>
              <ConceptHero
                titleEdit={titleEdit}
                description={heroDescription}
                imageUrl={conceptImageUrl}
                imageAlt={concept?.title || 'Concept image'}
                creator={concept?.createdBy}
                conceptUuid={conceptUuid}
                isHistoricalVersion={concept?.isHistoricalVersion}
                uploadMutation={uploadMutation}
                isCustomActive={
                  !!conceptOverview?.useCustomImage &&
                  !!conceptOverview?.customImageUrl
                }
                customImageUrl={conceptOverview?.customImageUrl}
                onRevertToAI={handleRevertToAI}
                isRevertingImage={updateSettings.isLoading}
              />
            </div>
          </>
        )}

        {/* Glass Tab Navigation — sentinel for sticky nav detection */}
        <div className='relative'>
          <div
            ref={navSentinelRef}
            className={cn({
              'pointer-events-none': isConceptLoading || isConceptFetching,
            })}
          >
            <ConceptNavigation
              tabs={conceptTabs}
              activeTab={activeTab || ''}
              onTabSelect={onTabSelect}
            />
          </div>

          {/* Versions dropdown */}
          <AnimatePresence>
            {showVersions && conceptUuid && conceptIdentifier && (
              <motion.div
                ref={versionsRef}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className='fixed z-40 w-80'
                style={{
                  top: versionsDropdownPos.top,
                  right: versionsDropdownPos.right,
                }}
                onMouseEnter={clearVersionsHideTimer}
                onMouseLeave={startVersionsHideTimer}
              >
                <ConceptVersionsDropdown
                  conceptUuid={conceptUuid}
                  conceptIdentifier={conceptIdentifier}
                  onClose={() => setShowVersions(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sticky Nav — hidden when viewing a historical version */}
        {!(concept?.isHistoricalVersion && FEATURE_CONCEPT_VERSIONING) && (
          <StickyConceptNav
            sentinelRef={navSentinelRef}
            tabs={conceptTabs}
            conceptImage={conceptImageUrl}
            conceptTitle={concept?.title}
            activeTab={activeTab || ''}
            onTabChange={onTabSelect}
          />
        )}

        {/* Tab Content */}
        <div className='flex h-full w-full flex-col flex-wrap items-start gap-6 self-stretch'>
          <div
            className={cn('w-full', {
              'user-select-auto webkit-user-select-auto pointer-events-none select-text select-auto':
                concept?.isHistoricalVersion,
            })}
          >
            {!concept ? (
              <div className='flex h-full min-h-96 w-full items-center justify-center align-middle'>
                <Loading />
              </div>
            ) : (
              <div key={activeTab} className='animate-fade-in'>
                <ConceptReportContext.Provider
                  value={{
                    navigateToTab: onTabSelect,
                    concept: concept,
                    isReadOnly,
                  }}
                >
                  <Outlet
                    context={{
                      navigateToTab: onTabSelect,
                      concept: concept,
                      isReadOnly,
                    }}
                  />
                </ConceptReportContext.Provider>
              </div>
            )}
          </div>
        </div>
        <LoadingMask
          isLoading={
            isConceptLoading || isConceptFetching || isReverting || isCancelling
          }
        />
      </div>

      {concept?.isHistoricalVersion && FEATURE_CONCEPT_VERSIONING && (
        <div className='aucctus-bg-primary fixed left-1/2 top-0 z-50 flex -translate-x-1/2 animate-fade-in flex-row items-center justify-center gap-2 rounded-b-md px-4 py-2 shadow-md'>
          <span className='flex min-h-6 min-w-6 items-center justify-center'>
            <AlertTriangle size={16} className='stroke-warning-500' />
          </span>
          <span className='aucctus-text-brand-secondary aucctus-text-sm-medium mr-2'>
            You are viewing a historical version of this concept
          </span>
          <button
            onClick={() =>
              openModal(Modal.Confirmation, {
                title: 'Are you sure you want to revert to this version?',
                subtitle: (
                  <>
                    Once reverted, you will lose any current changes you have
                    made to this concept.
                    <br />
                    <strong>WARNING:</strong> This action cannot be undone!
                  </>
                ),
                actions: [
                  {
                    title: 'Revert',
                    onClick: () =>
                      commitConceptVersionRevert(
                        {
                          uuid: conceptUuid!,
                          conceptIdentifier: conceptIdentifier!,
                        },
                        {
                          onSuccess: () => {
                            closeModal();
                          },
                        },
                      ),
                    variant: 'warning',
                  },
                  {
                    title: 'Cancel',
                    onClick: () => {
                      closeModal();
                    },
                    variant: 'secondary',
                  },
                ],
              })
            }
            className='btn btn-bold btn-primary aucctus-text-brand-primary group hover:bg-primary-900 hover:text-white'
          >
            Revert
          </button>
          <button
            onClick={() =>
              cancelConceptVersionRevert({
                uuid: conceptUuid!,
                conceptIdentifier: conceptIdentifier!,
              })
            }
            className='btn btn-bold btn-secondary aucctus-text-brand-primary group hover:bg-primary-900 hover:text-white'
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
};

export default ConceptReport;
