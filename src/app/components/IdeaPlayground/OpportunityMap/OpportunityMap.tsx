import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { Icon, toast } from '@components';
import type { IGeneratedIdeaPlaygroundConcept } from '../types';
import {
  getAnimationStyle,
  animationStyles,
} from '@components/Card/ConceptGeneration/UserExploration/components/util/animation-keyframes';
import ConceptDetailPanel from './ConceptDetailPanel';
import OpportunityMapFooter from './OpportunityMapFooter';
import ConceptCard from './ConceptCard';
import LogoAnimation from '@components/Animation/LogoAnimation';
import api from '@libs/api';
import useStore from '@stores/store';
import telemetry from '@libs/telemetry';
import {
  useAnchorThought,
  useGetGeneratedIdeas,
  useGenerateMoreConcepts,
  useRegenerateConceptsWithFeedback,
  useDeleteGeneratedConcept,
} from '@hooks/query/ideaPlayground.hook';
import { ConceptGenerationLoading } from '../ConceptGenerationLoading';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '@routes/routes';
import { useSocketEvent } from '@hooks/sockets/aucctus';

interface OpportunityMapProps {
  seedUuid: string | null;
  onClose: () => void;
}

// Fun rotating messages for concept generation loading
const GENERATION_MESSAGES = [
  'Brewing innovative ideas...',
  'Exploring new possibilities...',
  'Connecting the dots...',
  'Thinking outside the box...',
  'Sparking creativity...',
  'Discovering hidden gems...',
  'Crafting unique concepts...',
  'Mixing inspiration with insight...',
  'Unlocking potential...',
  'Dreaming up the future...',
  'Weaving ideas together...',
  'Chasing brilliance...',
  'Hatching something special...',
  'Polishing rough diamonds...',
  'Igniting imagination...',
];

const OpportunityMap: React.FC<OpportunityMapProps> = ({
  seedUuid,
  onClose,
}) => {
  // Only use store for temporary UI state (concept selection)
  const selectedConceptUuids = useStore(
    (state) => state.ideaPlayground.selectedConceptUuids,
  );
  const toggleConceptSelection = useStore(
    (state) => state.ideaPlayground.toggleConceptSelection,
  );
  const clearSelectedConcepts = useStore(
    (state) => state.ideaPlayground.clearSelectedConcepts,
  );
  const navigate = useNavigate();

  // Use the GET hook to check and fetch generated concepts
  const {
    isGenerating: isGeneratingConcepts,
    concepts,
    refetch: refetchGeneratedIdeas,
    generatingMore,
  } = useGetGeneratedIdeas(seedUuid || undefined);

  // Hook for generating more concepts
  const { generateMore, error: generateMoreError } = useGenerateMoreConcepts(
    seedUuid || '',
  );

  // Hook for regenerating concepts with feedback
  const { regenerateWithFeedback, isLoading: isRegenerateLoading } =
    useRegenerateConceptsWithFeedback(seedUuid || '');

  // Hook for deleting concepts
  const { deleteConcept } = useDeleteGeneratedConcept(seedUuid || '');

  // Track which concept is being deleted
  const [deletingConceptUuid, setDeletingConceptUuid] = useState<string | null>(
    null,
  );

  // Track new concepts (from Generate More or Regenerate)
  const [newConceptUuids, setNewConceptUuids] = useState<Set<string>>(
    new Set(),
  );
  // Track concept UUIDs before generation to determine which are new
  const conceptsBeforeGenerationRef = useRef<Set<string>>(new Set());

  const { data: anchorThoughts } = useAnchorThought(seedUuid || undefined);
  // Local state
  const [isClosing, setIsClosing] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);
  // Track if we're in a regeneration flow (to show loading state immediately)
  const [isRegenerating, setIsRegenerating] = useState(false);
  // Rotating message index for loading overlay
  const [messageIndex, setMessageIndex] = useState(0);

  // Generate More button progress animation state
  const [generateMoreProgress, setGenerateMoreProgress] = useState(0);
  const [generateMorePhase, setGenerateMorePhase] = useState<
    'idle' | 'loading' | 'completing' | 'fading'
  >('idle');
  const generateMoreStartTimeRef = useRef<number | null>(null);
  // Track when we've initiated a "generate more" action locally
  const [localGeneratingMore, setLocalGeneratingMore] = useState(false);
  // Track if backend has confirmed generation started (generatingMore was true)
  const backendConfirmedGeneratingRef = useRef(false);
  const wasGeneratingMoreRef = useRef(false);

  // Determine if we should show the loading overlay on concepts grid
  // Only show for regenerate (full regeneration), NOT for generating more
  const showConceptsLoadingOverlay = useMemo(
    () => isRegenerateLoading || isRegenerating,
    [isRegenerateLoading, isRegenerating],
  );

  // Rotate messages every 3 seconds when loading overlay is visible
  useEffect(() => {
    if (!showConceptsLoadingOverlay) {
      setMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % GENERATION_MESSAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [showConceptsLoadingOverlay]);

  // Generate More button progress animation
  // Use local state OR backend state to prevent flickering during the brief gap
  // between mutation completion and query refetch
  const isGeneratingMore = localGeneratingMore || generatingMore;

  // Calculate asymptotic progress: approaches 95% but never reaches it
  // Formula: progress = 95 * (1 - e^(-t/tau)) where tau controls speed
  const calculateAsymptoticProgress = useCallback(
    (elapsedMs: number): number => {
      const tau = 8000; // 8 seconds to reach ~63% of max
      const maxProgress = 95;
      return maxProgress * (1 - Math.exp(-elapsedMs / tau));
    },
    [],
  );

  // Handle the generate more progress animation
  useEffect(() => {
    // Detect when loading starts
    if (isGeneratingMore && !wasGeneratingMoreRef.current) {
      wasGeneratingMoreRef.current = true;
      generateMoreStartTimeRef.current = Date.now();
      setGenerateMorePhase('loading');
      setGenerateMoreProgress(0);
    }

    // Detect when loading ends
    if (!isGeneratingMore && wasGeneratingMoreRef.current) {
      wasGeneratingMoreRef.current = false;
      // Rush to completion
      setGenerateMorePhase('completing');
      setGenerateMoreProgress(100);

      // After completion animation, start fading
      const fadeTimer = setTimeout(() => {
        setGenerateMorePhase('fading');
      }, 300);

      // After fade, return to idle
      const idleTimer = setTimeout(() => {
        setGenerateMorePhase('idle');
        setGenerateMoreProgress(0);
        generateMoreStartTimeRef.current = null;
      }, 800);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(idleTimer);
      };
    }

    // Update progress during loading
    if (generateMorePhase === 'loading' && generateMoreStartTimeRef.current) {
      const updateProgress = () => {
        if (generateMoreStartTimeRef.current) {
          const elapsed = Date.now() - generateMoreStartTimeRef.current;
          setGenerateMoreProgress(calculateAsymptoticProgress(elapsed));
        }
      };

      updateProgress();
      const interval = setInterval(updateProgress, 50);
      return () => clearInterval(interval);
    }
  }, [isGeneratingMore, generateMorePhase, calculateAsymptoticProgress]);

  const [selectedIdeaDetail, setSelectedIdeaDetail] = useState<{
    title: string;
    section: string;
    icon: string;
    description?: string;
    rationale?: string;
    initialGutCheck?: string;
    problemItSolves?: string;
    uniqueValueProposition?: string;
    reasonsToBelieve?: string[];
    reasonsToChallenge?: string[];
    alignment?: string[];
  } | null>(null);

  // Handle initial mount - show loading until we have concepts or confirm we're generating
  useEffect(() => {
    if (isInitialMount && (concepts.length > 0 || isGeneratingConcepts)) {
      setIsInitialMount(false);
    }
  }, [isInitialMount, concepts.length, isGeneratingConcepts]);

  // Reset regenerating state when concepts are refreshed (generation complete)
  useEffect(() => {
    if (
      isRegenerating &&
      concepts.length > 0 &&
      !isGeneratingConcepts &&
      !generatingMore
    ) {
      setIsRegenerating(false);
    }
  }, [isRegenerating, concepts.length, isGeneratingConcepts, generatingMore]);

  // Track previous loading state to detect transition from loading to concepts
  const wasLoadingRef = useRef(true);

  // Auto-select first concept when transitioning from loading state to concepts view
  useEffect(() => {
    const isCurrentlyLoading =
      isGeneratingConcepts || isInitialMount || isRegenerating;
    const wasLoading = wasLoadingRef.current;

    // Update the ref for next render
    wasLoadingRef.current = isCurrentlyLoading;

    // If we just transitioned from loading to not loading, and we have concepts
    if (wasLoading && !isCurrentlyLoading && concepts.length > 0) {
      // Auto-select the first concept to show in the detail panel
      const firstConcept = concepts[0];
      setSelectedIdeaDetail({
        title: firstConcept.title,
        section: firstConcept.conceptType,
        icon: firstConcept.icon || 'lightbulb',
        description: firstConcept.description,
        rationale: firstConcept.rationale,
        initialGutCheck: firstConcept.initialGutCheck,
        problemItSolves: firstConcept.problemItSolves,
        uniqueValueProposition: firstConcept.uniqueValueProposition,
        reasonsToBelieve: firstConcept.reasonsToBelieve,
        reasonsToChallenge: firstConcept.reasonsToChallenge,
        alignment: firstConcept.alignment,
      });
    }
  }, [isGeneratingConcepts, isInitialMount, isRegenerating, concepts]);

  /**
   * Handle regeneration with feedback
   * Shows loading state immediately, triggers the mutation
   */
  const handleRegenerateWithFeedback = useCallback(
    (feedback: string) => {
      // Clear any selected concepts before regenerating
      clearSelectedConcepts();
      setSelectedIdeaDetail(null);
      // Clear new concept tracking and track current concepts
      conceptsBeforeGenerationRef.current = new Set(
        concepts.map((c) => c.uuid),
      );
      setNewConceptUuids(new Set());
      setIsRegenerating(true);
      regenerateWithFeedback(feedback, {
        onError: () => {
          setIsRegenerating(false);
        },
      });
      telemetry.log('ideaPlayground.regenerateWithFeedback.initiated', {
        seedUuid,
        feedbackLength: feedback.length,
      });
    },
    [regenerateWithFeedback, seedUuid, clearSelectedConcepts, concepts],
  );

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  /**
   * Handle generating more concepts
   * Clears selections before generating
   */
  const handleGenerateMore = useCallback(() => {
    // Clear any selected concepts before generating more
    clearSelectedConcepts();
    setSelectedIdeaDetail(null);
    // Track current concepts before generating more
    conceptsBeforeGenerationRef.current = new Set(concepts.map((c) => c.uuid));
    // Set local state immediately to prevent flickering
    setLocalGeneratingMore(true);
    // Reset the backend confirmation tracker
    backendConfirmedGeneratingRef.current = false;
    generateMore();
  }, [generateMore, clearSelectedConcepts, concepts]);

  // Track when backend confirms generation has started, then clear local state when it ends
  useEffect(() => {
    // If backend says it's generating, mark that we've seen confirmation
    if (generatingMore) {
      backendConfirmedGeneratingRef.current = true;
    }

    // Only clear local state if:
    // 1. Backend has confirmed it was generating at some point
    // 2. Backend now says it's no longer generating
    // 3. We still have local state set
    if (
      backendConfirmedGeneratingRef.current &&
      !generatingMore &&
      localGeneratingMore
    ) {
      setLocalGeneratingMore(false);
      backendConfirmedGeneratingRef.current = false;
    }
  }, [generatingMore, localGeneratingMore]);

  // Reset local generating state if there's an error from the generateMore mutation
  useEffect(() => {
    if (generateMoreError && localGeneratingMore) {
      setLocalGeneratingMore(false);
      backendConfirmedGeneratingRef.current = false;
      // Reset the progress animation state
      setGenerateMorePhase('idle');
      setGenerateMoreProgress(0);
      generateMoreStartTimeRef.current = null;
      wasGeneratingMoreRef.current = false;
    }
  }, [generateMoreError, localGeneratingMore]);

  // WebSocket listener for concepts generated - refetch when ready
  useSocketEvent<'idea_playground.concepts.generated.user'>(
    'idea_playground.concepts.generated.user',
    (data) => {
      if (data.seedUuid === seedUuid) {
        telemetry.log('ideaPlayground.concepts.generated.websocket', {
          conceptCount: data.conceptCount,
          coreCount: data.coreCount,
          adjacentCount: data.adjacentCount,
          disruptiveCount: data.disruptiveCount,
        });
        // Refetch the generated concepts
        refetchGeneratedIdeas();
      }
    },
  );

  // WebSocket listener for more concepts generated - refetch when ready
  useSocketEvent<'idea_playground.more_concepts.generated.user'>(
    'idea_playground.more_concepts.generated.user',
    (data) => {
      if (data.seedUuid === seedUuid) {
        telemetry.log('ideaPlayground.moreConceptsGenerated.websocket', {
          newConceptCount: data.newConceptCount,
          totalConceptCount: data.totalConceptCount,
        });
        // Refetch the generated concepts
        refetchGeneratedIdeas();
      }
    },
  );

  // Track new concepts when concepts array changes after generation
  useEffect(() => {
    if (conceptsBeforeGenerationRef.current.size > 0 && concepts.length > 0) {
      const newUuids = concepts
        .filter((c) => !conceptsBeforeGenerationRef.current.has(c.uuid))
        .map((c) => c.uuid);
      if (newUuids.length > 0) {
        setNewConceptUuids((prev) => new Set([...prev, ...newUuids]));
        // Clear the reference after processing
        conceptsBeforeGenerationRef.current = new Set();
      }
    }
  }, [concepts]);

  // Polling fallback - refetch every 60 seconds while generating
  useEffect(() => {
    if (!isGeneratingConcepts || !seedUuid) return;

    const pollInterval = setInterval(() => {
      telemetry.log('ideaPlayground.concepts.polling', { seedUuid });
      refetchGeneratedIdeas();
    }, 60000); // 60 seconds

    return () => clearInterval(pollInterval);
  }, [isGeneratingConcepts, seedUuid, refetchGeneratedIdeas]);

  // Inject keyframe animations
  useEffect(() => {
    const styleId = 'opportunitymap-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent =
        animationStyles +
        `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.2;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.4;
            transform: translate(-50%, -50%) scale(1.15);
          }
        }

        @keyframes logoPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handleCardSelect = (conceptUuid: string) => {
    toggleConceptSelection(conceptUuid);
  };

  /** Get icon variant from backend - assigned by AI based on concept's domain/mechanism */
  const getIconVariant = (
    concept: IGeneratedIdeaPlaygroundConcept,
  ): IconVariant => concept.icon || 'lightbulb';

  const handleCardClick = (concept: IGeneratedIdeaPlaygroundConcept) => {
    setSelectedIdeaDetail({
      title: concept.title,
      section: concept.conceptType,
      icon: getIconVariant(concept),
      description: concept.description,
      rationale: concept.rationale,
      initialGutCheck: concept.initialGutCheck,
      problemItSolves: concept.problemItSolves,
      uniqueValueProposition: concept.uniqueValueProposition,
      reasonsToBelieve: concept.reasonsToBelieve,
      reasonsToChallenge: concept.reasonsToChallenge,
      alignment: concept.alignment,
    });
  };

  const handleCircleClick = (conceptUuid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleCardSelect(conceptUuid);
  };

  /**
   * Handle deleting a generated concept
   * Clears selection if the deleted concept was selected
   * Clears detail panel if the deleted concept was being viewed
   */
  const handleDeleteConcept = useCallback(
    (conceptUuid: string, conceptTitle: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setDeletingConceptUuid(conceptUuid);

      deleteConcept(conceptUuid, {
        onSuccess: () => {
          // If this concept was selected, deselect it
          if (selectedConceptUuids.includes(conceptUuid)) {
            toggleConceptSelection(conceptUuid);
          }

          // If this concept was being viewed in detail panel, close it
          if (selectedIdeaDetail?.title === conceptTitle) {
            setSelectedIdeaDetail(null);
          }

          telemetry.log('ideaPlayground.concept.deleted.ui', {
            seedUuid,
            conceptUuid,
          });
          setDeletingConceptUuid(null);
        },
        onError: () => {
          setDeletingConceptUuid(null);
        },
      });
    },
    [
      deleteConcept,
      selectedConceptUuids,
      toggleConceptSelection,
      selectedIdeaDetail,
      seedUuid,
    ],
  );

  // Track if we're saving concepts
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Save concepts only (without generating reports)
   */
  const handleSaveConcepts = async () => {
    if (!seedUuid || selectedConceptUuids.length === 0) {
      toast.warning('Please select at least one concept to save');
      return;
    }

    setIsSaving(true);
    try {
      await api.ideaPlayground.saveConcepts(seedUuid, selectedConceptUuids);
      toast.success(
        `Saved ${selectedConceptUuids.length} concept${selectedConceptUuids.length > 1 ? 's' : ''}`,
      );
      telemetry.log('ideaPlayground.concepts.saved', {
        count: selectedConceptUuids.length,
        seedUuid: seedUuid,
        generateReports: false,
      });
      // Navigate to ConceptBank after saving
      handleClose();
      navigate(AppPath.ConceptBank);
    } catch (error) {
      telemetry.error('ideaPlayground.concepts.save.failed', error);
      toast.error('Failed to save concepts', undefined, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Save concepts AND generate reports for each
   */
  const handleGenerateReports = async () => {
    if (!seedUuid || selectedConceptUuids.length === 0) {
      toast.warning('Please select at least one concept to save');
      return;
    }

    setIsSaving(true);
    try {
      // First save the concepts
      await api.ideaPlayground.saveConcepts(seedUuid, selectedConceptUuids);

      telemetry.log('ideaPlayground.concepts.saved', {
        count: selectedConceptUuids.length,
        seedUuid: seedUuid,
        generateReports: true,
      });

      // Then trigger report generation for each saved concept
      const reportPromises = selectedConceptUuids.map((conceptUuid) =>
        api.concept.generateReport(conceptUuid).catch((error) => {
          telemetry.error('ideaPlayground.concept.generateReport.failed', {
            conceptUuid,
            error,
          });
          // Don't throw - we want to continue with other concepts
          return null;
        }),
      );

      await Promise.all(reportPromises);

      toast.success(
        `Saved ${selectedConceptUuids.length} concept${selectedConceptUuids.length > 1 ? 's' : ''} and started report generation`,
      );

      telemetry.log('ideaPlayground.concepts.reportsTriggered', {
        count: selectedConceptUuids.length,
        seedUuid: seedUuid,
      });

      // Navigate to ConceptBank after saving and triggering reports
      handleClose();
      navigate(AppPath.ConceptBank);
    } catch (error) {
      telemetry.error('ideaPlayground.concepts.saveAndGenerate.failed', error);
      toast.error('Failed to save concepts', undefined, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Get momentumScore from concepts
  const getMomentumScore = (): string | undefined => {
    return concepts.find((c) => c.title === selectedIdeaDetail?.title)
      ?.momentumScore;
  };

  const conceptDetail = selectedIdeaDetail
    ? {
        shouldWeDo:
          selectedIdeaDetail.rationale || 'Rationale being generated...',
        whatIsIt:
          selectedIdeaDetail.description || 'Description being generated...',
        description:
          selectedIdeaDetail.description || 'Description being generated...',
        conceptType: selectedIdeaDetail.section as
          | 'Core'
          | 'Adjacent'
          | 'Disruptive',
        momentumScore: getMomentumScore(),
        initialGutCheck: selectedIdeaDetail.initialGutCheck,
        problemItSolves:
          selectedIdeaDetail.problemItSolves || 'Analysis in progress',
        uniqueValue:
          selectedIdeaDetail.uniqueValueProposition || 'Analysis in progress',
        reasonsToBelieve: selectedIdeaDetail.reasonsToBelieve || [
          'Market validation pending',
        ],
        reasonsToChallenge: selectedIdeaDetail.reasonsToChallenge || [
          'Risk assessment pending',
        ],
        alignment: selectedIdeaDetail.alignment || [
          'Strategic alignment being determined',
        ],
      }
    : null;

  // Show loading state while generating/regenerating concepts or on initial mount (prevents flash of content)
  if (isGeneratingConcepts || isInitialMount || isRegenerating) {
    return (
      <div className='absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xl'>
        <ConceptGenerationLoading />
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 z-50 bg-black/30 backdrop-blur-xl transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
    >
      <div
        className='flex h-full w-full flex-col'
        style={!isClosing ? getAnimationStyle('fadeIn', 300, 0) : undefined}
      >
        {/* Header */}
        <div
          className={`relative flex shrink-0 items-center justify-center border-b border-white/20 p-6 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
          style={
            !isClosing
              ? getAnimationStyle('slideInFromTop', 600, 200)
              : undefined
          }
        >
          {/* Back Button - Left */}
          <div className='absolute left-6'>
            <button
              onClick={handleClose}
              className='btn btn-secondary aucctus-text-white flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 transition-colors hover:bg-white/15'
            >
              <Icon
                variant='arrowleft'
                className='aucctus-stroke-white'
                height={16}
                width={16}
              />
              <span className='aucctus-text-sm aucctus-text-white'>
                Back to Playground
              </span>
            </button>
          </div>

          {/* Center Content */}
          <div className='text-center'>
            <h1 className='aucctus-text-xl-bold aucctus-text-white'>
              Concept Generator
            </h1>
            <p className='aucctus-text-white opacity-60'>
              {anchorThoughts?.title ||
                anchorThoughts?.thought ||
                'Idea playground'}
            </p>
          </div>
        </div>

        {/* Split Content */}
        <div className='flex min-h-0 flex-1'>
          {/* Left Side - 2x2 Grid */}
          <div className='relative flex w-1/2 flex-col border-r border-white/10'>
            {/* Loading Overlay for Concepts Grid */}
            {showConceptsLoadingOverlay && (
              <div className='absolute inset-0 z-10 flex animate-fade-in flex-col items-center justify-center bg-black bg-opacity-40'>
                {/* Logo with pulsating glow */}
                <div className='relative flex flex-col items-center'>
                  {/* Pulsating glow behind logo */}
                  <div className='absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 animate-[glowPulse_3s_ease-in-out_infinite] rounded-full bg-white/20 blur-2xl' />
                  {/* Animated logo with subtle pulse */}
                  <div className='relative animate-[logoPulse_2s_ease-in-out_infinite]'>
                    <LogoAnimation size={120} loop autoPlay fps={90} />
                  </div>
                </div>
                <p
                  key={messageIndex}
                  className='aucctus-text-md-medium mt-6 animate-fade-in text-white/90'
                  style={{
                    animation: 'fadeInUp 0.5s ease-out',
                  }}
                >
                  {GENERATION_MESSAGES[messageIndex]}
                </p>
              </div>
            )}

            {/* Ideas Grid - Scrollable */}
            <div className='flex-1 overflow-y-auto p-6'>
              <div className='grid grid-cols-2 gap-4'>
                {concepts.map((concept, index) => (
                  <ConceptCard
                    key={concept.uuid}
                    concept={concept}
                    isSelected={selectedConceptUuids.includes(concept.uuid)}
                    isActive={selectedIdeaDetail?.title === concept.title}
                    isDeleting={deletingConceptUuid === concept.uuid}
                    isNew={newConceptUuids.has(concept.uuid)}
                    onCardClick={() => handleCardClick(concept)}
                    onCardSelect={(e) => handleCircleClick(concept.uuid, e)}
                    onDelete={(e) =>
                      handleDeleteConcept(concept.uuid, concept.title, e)
                    }
                    animationDelay={index * 0.1}
                  />
                ))}
              </div>
            </div>

            {/* Generate More Button with Progress Fill */}
            <div className='px-6 pb-6'>
              <button
                className='aucctus-text-white aucctus-text-sm relative w-full overflow-hidden rounded-lg border border-white/30 bg-transparent py-2 transition-all hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50'
                disabled={isGeneratingMore || isRegenerateLoading}
                onClick={handleGenerateMore}
              >
                {/* Progress fill background */}
                {generateMorePhase !== 'idle' && (
                  <div
                    className='absolute inset-0 bg-white/20'
                    style={{
                      width: `${generateMoreProgress}%`,
                      transition:
                        generateMorePhase === 'completing'
                          ? 'width 300ms ease-out'
                          : generateMorePhase === 'fading'
                            ? 'opacity 500ms ease-out'
                            : 'width 50ms linear',
                      opacity: generateMorePhase === 'fading' ? 0 : 1,
                    }}
                  />
                )}
                {/* Button text */}
                <span className='relative z-10'>
                  {isGeneratingMore ? 'Generating More...' : 'Generate More'}
                </span>
              </button>
            </div>
          </div>

          {/* Right Side - Detail Panel */}
          <div className='w-1/2 overflow-y-auto p-6'>
            <ConceptDetailPanel
              title={selectedIdeaDetail?.title || ''}
              icon={selectedIdeaDetail?.icon || ''}
              conceptDetail={conceptDetail}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className={`shrink-0 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
          style={
            !isClosing
              ? getAnimationStyle('slideInFromBottom', 600, 400)
              : undefined
          }
        >
          <OpportunityMapFooter
            selectedIdeasCount={selectedConceptUuids.length}
            onSaveConcepts={handleSaveConcepts}
            onGenerateReports={handleGenerateReports}
            onRegenerateWithFeedback={handleRegenerateWithFeedback}
            isRegenerating={isRegenerateLoading || isGeneratingMore}
            isSaving={isSaving}
            disabled={isGeneratingMore}
          />
        </div>
      </div>
    </div>
  );
};

export default OpportunityMap;
