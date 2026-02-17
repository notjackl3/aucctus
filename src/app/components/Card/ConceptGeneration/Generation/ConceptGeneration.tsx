import images from '@assets/img';
import { useConceptGeneration, useSeed } from '@hooks/query/concepts.hook';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import { IGeneratedConcept } from '@libs/api/types';
import { useConceptGenerationStore } from '@stores/concept-generation.store';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  animationStyles,
  getAnimationStyle,
} from '../UserExploration/components/util/animation-keyframes';
import FloatingAiIcon from './FloatingAiIcon';
import { AgentProgressBar } from '@components/Progress';
import { motion } from 'framer-motion';

const getFadeInStyle = (duration: number, delay: number = 0) =>
  getAnimationStyle('fadeIn', duration, delay);

const getFadeOutStyle = (duration: number, delay: number = 0) =>
  getAnimationStyle('fadeOut', duration, delay);

const mainStyle = {
  backgroundImage: `url(${images.aiExplorationsBackground})`,
  backgroundSize: 'cover',
  animation: 'moveBackground 30s ease infinite',
};

interface ConceptGenerationProps {
  className?: string;
  onGenerateComplete: () => void;
}

const ConceptGeneration = React.forwardRef<
  HTMLDivElement,
  ConceptGenerationProps
>(({ className = '', onGenerateComplete }, ref) => {
  // State and refs
  const { draftSeedUuid } = useConceptIncubationStore();
  const [concepts, setConcepts] = React.useState<IGeneratedConcept[]>([]);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { mutate: generateConcept } = useConceptGeneration(draftSeedUuid);
  const animatedTitles = useRef<Set<string>>(new Set());
  const conceptsContainerRef = React.useRef<HTMLDivElement>(null);
  const { setGeneratedConcepts } = useConceptGenerationStore();
  const hasGenerated = useRef(false);
  const conceptArrivalTimes = useRef<number[]>([]);

  // Get search params and seed data to check for cached concepts
  const [searchParams] = useSearchParams();
  const seedUuid = searchParams.get('seed') || undefined;
  const { data: seedDraftData } = useSeed(seedUuid, { status: 'draft' });

  // Check if we have cached concepts
  const hasCachedConcepts = useMemo(() => {
    return (
      seedDraftData?.cachedConcepts &&
      Array.isArray(seedDraftData.cachedConcepts) &&
      seedDraftData.cachedConcepts.length > 0
    );
  }, [seedDraftData]);

  // Handle socket events for concept generation (only if no cached concepts)
  // When cached concepts exist, we skip real-time generation and use cached data
  useSocketEvent('stream.structured.concept.generation', (data) => {
    // Skip socket handling if we have cached concepts
    if (hasCachedConcepts) return;

    const { concepts: eventConcepts } = data?.content ?? {};

    if ('done' === data.stage && eventConcepts) {
      setConcepts(eventConcepts);
      setGeneratedConcepts(draftSeedUuid, eventConcepts as IGeneratedConcept[]);
      setTimeout(() => handleGenerateComplete(), 3000);
    } else if ('delta' === data.stage && eventConcepts) {
      if (eventConcepts.length - 1 > concepts.length) {
        const newConceptCount = eventConcepts.length - 1;

        // Track arrival time when a new concept arrives
        if (newConceptCount > conceptArrivalTimes.current.length) {
          conceptArrivalTimes.current.push(Date.now());
        }

        setConcepts(eventConcepts.slice(0, -1));
      }
    }
  });

  const conceptAnimated = useCallback((concept: IGeneratedConcept) => {
    return !!concept.title && animatedTitles.current.has(concept.title);
  }, []);

  const handleGenerateComplete = useCallback(() => {
    const content = contentRef.current;
    const conceptsContainer = conceptsContainerRef.current;

    if (!content || !conceptsContainer) return;

    conceptsContainer.childNodes.forEach((child, index) => {
      const childElement = child as HTMLElement;
      childElement.classList.add(
        'transition-all',
        'duration-300',
        'ease-in-out',
      );
      setTimeout(() => (childElement.style.opacity = '0'), 200 * index);
    });

    setTimeout(() => Object.assign(content.style, getFadeOutStyle(300)), 1000);
    setTimeout(() => onGenerateComplete(), 1500);
  }, [onGenerateComplete]);

  useEffect(() => {
    if (hasGenerated.current) return;
    hasGenerated.current = true;

    // If we have cached concepts, use them directly instead of generating new ones
    if (hasCachedConcepts && seedDraftData?.cachedConcepts) {
      // Set the cached concepts immediately
      setConcepts(seedDraftData.cachedConcepts);
      setGeneratedConcepts(draftSeedUuid, seedDraftData.cachedConcepts);

      // Simulate the generation timing but complete faster since we have the data
      setTimeout(() => handleGenerateComplete(), 2000);
      return;
    }

    // Normal generation flow for new concepts
    // Reset timing trackers for this generation run
    conceptArrivalTimes.current = [];

    generateConcept(undefined, {
      onError: () => {
        const event = new CustomEvent('aucctus-generate-concept', {
          detail: { revert: true, error: true },
        });
        window.dispatchEvent(event);
      },
    });
  }, [
    generateConcept,
    hasCachedConcepts,
    seedDraftData,
    setConcepts,
    setGeneratedConcepts,
    draftSeedUuid,
    handleGenerateComplete,
  ]);

  // UI Component renderers
  const renderLoadingText = () => (
    <div className='my-4 flex flex-col items-center justify-center gap-4'>
      <div
        style={getFadeInStyle(500, 500)}
        className='aucctus-text-white aucctus-text-lg'
      >
        {hasCachedConcepts ? 'Loading your concepts' : 'Generating concepts'}
      </div>

      {hasCachedConcepts ? (
        <div
          style={getFadeInStyle(500, 1000)}
          className='aucctus-text-white aucctus-text-xs'
        >
          Using your previously generated concepts
        </div>
      ) : (
        <div className='w-full max-w-md px-4' style={getFadeInStyle(500, 1000)}>
          <AgentProgressBar
            agentName='ConceptGenerationPipeline'
            expectedItemCount={3}
            completedItemCount={concepts.length}
            itemCompletionTimestamps={conceptArrivalTimes.current}
            fallbackEstimatedSeconds={120}
            showTimeRemaining
            showPercentage={false}
            size='md'
            theme='brand'
            className='[&_*]:!text-white'
          />
        </div>
      )}
    </div>
  );

  const renderConcepts = () =>
    concepts.map((concept, index) => {
      const isAnimated = conceptAnimated(concept);
      const isFaded = concepts.length > -1 && index < concepts.length - 2;

      // Mark title as animated after first render
      if (concept.title) {
        animatedTitles.current.add(concept.title);
      }

      return (
        <motion.div
          key={concept.title || index}
          initial={{
            opacity: isFaded ? 0.15 : isAnimated ? 1 : 0,
            transform: isAnimated
              ? `translateY(${index * 20}px) scale(${0.9 + index * 0.05})`
              : 'translateY(0px) scale(1)',
            maxHeight: isAnimated ? '200px' : '0px',
            padding: isAnimated ? '20px' : '0px',
          }}
          animate={{
            opacity: index === concepts.length - 1 ? 1 : 0.15,
            transform: `translateY(${index * 20}px) scale(${0.9 + index * 0.05})`,
            maxHeight: '200px',
            padding: '20px',
          }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: 'top' }}
          className='aucctus-border-primary aucctus-bg-primary absolute flex w-full flex-col gap-2 overflow-hidden rounded-lg border border-opacity-25 bg-opacity-[0.3] p-4'
        >
          <span className='aucctus-text-white aucctus-text-sm'>
            {concept.title}
          </span>
          <span className='aucctus-text-white aucctus-text-xs line-clamp-3 min-h-[4em]'>
            {concept.summary}
          </span>
        </motion.div>
      );
    });

  return (
    <>
      <style>{animationStyles}</style>
      <div ref={ref} className={className} style={mainStyle}>
        <div
          ref={contentRef}
          style={getFadeInStyle(500)}
          className='opacity-1 flex h-full w-full flex-col items-center justify-center transition-all duration-300'
        >
          <span className='flex max-h-[25%] flex-1' />
          <div className='relative flex items-center justify-center'>
            <FloatingAiIcon />
          </div>
          {renderLoadingText()}
          <span
            ref={conceptsContainerRef}
            className='relative flex w-[50%] flex-1 flex-col'
          >
            {renderConcepts()}
          </span>
        </div>
      </div>
    </>
  );
});

ConceptGeneration.displayName = 'ConceptGeneration';

export default ConceptGeneration;
