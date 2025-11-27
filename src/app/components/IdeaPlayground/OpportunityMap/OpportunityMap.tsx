import React, { useEffect, useState, useCallback } from 'react';
import { Icon, toast } from '@components';
import type { IGeneratedIdeaPlaygroundConcept } from '../types';
import {
  getAnimationStyle,
  animationStyles,
} from '@components/Card/ConceptGeneration/UserExploration/components/util/animation-keyframes';
import ConceptDetailPanel from './ConceptDetailPanel';
import OpportunityMapFooter from './OpportunityMapFooter';
import ConceptCard from './ConceptCard';
import api from '@libs/api';
import useStore from '@stores/store';
import telemetry from '@libs/telemetry';
import {
  useAnchorThought,
  useGetGeneratedIdeas,
} from '@hooks/query/ideaPlayground.hook';
import { PlaygroundLoadingIndicator } from '../PlaygroundLoadingIndicator';
import { AgentProgressBar } from '@components/Progress';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '@routes/routes';
import { useSocketEvent } from '@hooks/sockets/aucctus';

interface OpportunityMapProps {
  seedUuid: string | null;
  onClose: () => void;
}

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
  const navigate = useNavigate();

  // Use the GET hook to check and fetch generated concepts
  const {
    isGenerating: isGeneratingConcepts,
    concepts,
    refetch: refetchGeneratedIdeas,
  } = useGetGeneratedIdeas(seedUuid || undefined);

  const { data: anchorThoughts } = useAnchorThought(seedUuid || undefined);
  // Local state
  const [isClosing, setIsClosing] = useState(false);
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

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

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
        toast.success(`${data.conceptCount} concepts generated!`);
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
      style.textContent = animationStyles;
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

  // Backend generates fixed set of concepts (3+3+3), so remove "generate more" functionality
  // const generateMoreIdeas = ... (removed)

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

  // Show loading state while generating concepts
  if (isGeneratingConcepts) {
    return (
      <div className='absolute inset-0 z-50 bg-black/30 backdrop-blur-xl'>
        <div className='absolute left-1/2 top-1/2 z-[9999] flex -translate-x-1/2 -translate-y-1/2 transform flex-col items-center gap-6'>
          <PlaygroundLoadingIndicator
            show={true}
            message='Generating concepts...'
            className='flex items-center gap-3'
            usePortal={false}
          />

          {/* Progress Bar */}
          <div className='w-full max-w-md px-4'>
            <AgentProgressBar
              agentName='IdeaPlaygroundConceptGeneration'
              fallbackEstimatedSeconds={120}
              showTimeRemaining
              showPercentage={false}
              size='md'
              theme='brand'
              className='[&_*]:!text-white'
            />
          </div>
        </div>
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
          <div className='flex w-1/2 flex-col border-r border-white/10'>
            {/* Ideas Grid - Scrollable */}
            <div className='flex-1 overflow-y-auto p-6'>
              <div className='grid grid-cols-2 gap-4'>
                {concepts.slice(0, 6).map((concept, index) => (
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

            {/* Generate More Button - Disabled */}
            <div className='px-6 pb-4'>
              <button
                className='aucctus-text-white aucctus-text-sm w-full rounded-lg border border-white/30 bg-transparent py-2 transition-all hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50'
                disabled
              >
                Generate More (Coming Soon)
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
          />
        </div>
      </div>
    </div>
  );
};

export default OpportunityMap;
