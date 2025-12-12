import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
    canGenerateMore,
  } = useGetGeneratedIdeas(seedUuid || undefined);

  // Hook for generating more concepts
  const { generateMore, isLoading: isGenerateMoreLoading } =
    useGenerateMoreConcepts(seedUuid || '');

  // Hook for regenerating concepts with feedback
  const { regenerateWithFeedback, isLoading: isRegenerateLoading } =
    useRegenerateConceptsWithFeedback(seedUuid || '');

  const { data: anchorThoughts } = useAnchorThought(seedUuid || undefined);
  // Local state
  const [isClosing, setIsClosing] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);
  // Track if we're in a regeneration flow (to show loading state immediately)
  const [isRegenerating, setIsRegenerating] = useState(false);
  // Rotating message index for loading overlay
  const [messageIndex, setMessageIndex] = useState(0);

  // Determine if we should show the loading overlay on concepts grid
  const showConceptsLoadingOverlay = useMemo(
    () => generatingMore || isRegenerateLoading || isRegenerating,
    [generatingMore, isRegenerateLoading, isRegenerating],
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
    keyThingsToValidate?: string[];
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

  /**
   * Handle regeneration with feedback
   * Shows loading state immediately, triggers the mutation
   */
  const handleRegenerateWithFeedback = useCallback(
    (feedback: string) => {
      // Clear any selected concepts before regenerating
      clearSelectedConcepts();
      setSelectedIdeaDetail(null);
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
    [regenerateWithFeedback, seedUuid, clearSelectedConcepts],
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
    generateMore();
  }, [generateMore, clearSelectedConcepts]);

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
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handleCardSelect = (conceptUuid: string) => {
    toggleConceptSelection(conceptUuid);
  };

  // Determine icon based on concept type
  const getIconVariant = (
    conceptType: string,
  ): 'droplets' | 'layers' | 'chef-hat' | 'lightbulb' => {
    switch (conceptType) {
      case 'Core':
        return 'droplets';
      case 'Adjacent':
        return 'layers';
      case 'Disruptive':
        return 'chef-hat';
      default:
        return 'lightbulb';
    }
  };

  const handleCardClick = (concept: IGeneratedIdeaPlaygroundConcept) => {
    setSelectedIdeaDetail({
      title: concept.title,
      section: concept.conceptType,
      icon: getIconVariant(concept.conceptType),
      description: concept.description,
      rationale: concept.rationale,
      initialGutCheck: concept.initialGutCheck,
      problemItSolves: concept.problemItSolves,
      uniqueValueProposition: concept.uniqueValueProposition,
      reasonsToBelieve: concept.reasonsToBelieve,
      reasonsToChallenge: concept.reasonsToChallenge,
      keyThingsToValidate: concept.keyThingsToValidate,
    });
  };

  const handleCircleClick = (conceptUuid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleCardSelect(conceptUuid);
  };

  const handleGenerateReports = async () => {
    if (!seedUuid || selectedConceptUuids.length === 0) {
      toast.warning('Please select at least one concept to save');
      return;
    }

    try {
      await api.ideaPlayground.saveConcepts(seedUuid, selectedConceptUuids);
      toast.success(
        `Saved ${selectedConceptUuids.length} concept${selectedConceptUuids.length > 1 ? 's' : ''}`,
      );
      telemetry.log('ideaPlayground.concepts.saved', {
        count: selectedConceptUuids.length,
        seedUuid: seedUuid,
      });
      // Navigate or close after saving
      handleClose();
      navigate(AppPath.ConceptBank);
    } catch (error) {
      telemetry.error('ideaPlayground.concepts.save.failed', error);
      toast.error('Failed to save concepts', undefined, 3000);
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
        alignment: selectedIdeaDetail.keyThingsToValidate || [
          'Validation criteria being determined',
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
        className='relative h-full w-full'
        style={!isClosing ? getAnimationStyle('fadeIn', 300, 0) : undefined}
      >
        {/* Header */}
        <div
          className={`relative flex items-center justify-center border-b border-white/20 p-6 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
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
        <div className='flex h-[calc(100vh-200px)]'>
          {/* Left Side - 2x2 Grid */}
          <div className='relative flex w-1/2 flex-col border-r border-white/10'>
            {/* Loading Overlay for Concepts Grid */}
            {showConceptsLoadingOverlay && (
              <div className='absolute inset-0 z-10 flex animate-fade-in flex-col items-center justify-center bg-black bg-opacity-40'>
                <LogoAnimation size={120} loop autoPlay fps={45} />
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
                    onCardClick={() => handleCardClick(concept)}
                    onCardSelect={(e) => handleCircleClick(concept.uuid, e)}
                    animationDelay={index * 0.1}
                  />
                ))}
              </div>
            </div>

            {/* Generate More Button */}
            <div className='px-6 pb-6'>
              <button
                className='aucctus-text-white aucctus-text-sm w-full rounded-lg border border-white/30 bg-transparent py-2 transition-all hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50'
                disabled={
                  !canGenerateMore ||
                  generatingMore ||
                  isGenerateMoreLoading ||
                  isRegenerateLoading
                }
                onClick={handleGenerateMore}
              >
                {generatingMore || isGenerateMoreLoading
                  ? 'Generating More...'
                  : canGenerateMore
                    ? 'Generate More'
                    : 'Generate More Limit Reached'}
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
          className={`transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
          style={
            !isClosing
              ? getAnimationStyle('slideInFromBottom', 600, 400)
              : undefined
          }
        >
          <OpportunityMapFooter
            selectedIdeasCount={selectedConceptUuids.length}
            onGenerateReports={handleGenerateReports}
            onRegenerateWithFeedback={handleRegenerateWithFeedback}
            isRegenerating={isRegenerateLoading || generatingMore}
            disabled={generatingMore || isGenerateMoreLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default OpportunityMap;
