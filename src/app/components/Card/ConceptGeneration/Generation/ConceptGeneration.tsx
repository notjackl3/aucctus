import images from '@assets/img';
import { useConceptGeneration } from '@hooks/query/concepts.hook';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import { IGeneratedConcept } from '@libs/api/types';
import { animated, useTransition } from '@react-spring/web';
import { useConceptGenerationStore } from '@stores/concept-generation.store';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import React, { useCallback, useRef } from 'react';
import {
  animationStyles,
  getAnimationStyle,
} from '../UserExploration/components/util/animation-keyframes';
import LoadingIcon from './LoadingIcon';

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

  // Handle socket events for concept generation
  useSocketEvent('stream.structured.concept.generation', (data) => {
    const { concepts: eventConcepts } = data?.content;

    if (['done'].includes(data.stage) && eventConcepts) {
      setConcepts(eventConcepts);
      setGeneratedConcepts(draftSeedUuid, eventConcepts as IGeneratedConcept[]);
      setTimeout(() => handleGenerateComplete(), 3000);
    } else if (['delta'].includes(data.stage) && eventConcepts) {
      if (eventConcepts.length - 1 > concepts.length) {
        setConcepts(eventConcepts.slice(0, -1));
      }
    }
  });

  const conceptAnimated = useCallback((concept: IGeneratedConcept) => {
    return !!concept.title && animatedTitles.current.has(concept.title);
  }, []);

  const transitions = useTransition(concepts, {
    from: (concept, index) => {
      const isAnimated = conceptAnimated(concept);
      const isFaded = concepts.length > -1 && index < concepts.length - 2;

      return {
        opacity: isFaded ? 0.15 : isAnimated ? 1 : 0,
        transform: isAnimated
          ? `translateY(${index * 20}px) scale(${0.9 + index * 0.05})`
          : 'translateY(0px) scale(1)',
        maxHeight: isAnimated ? '200px' : '0px',
        padding: isAnimated ? '20px' : '0px',
      };
    },
    enter: (concept, index) => async (next) => {
      const animatedIndex = concepts.findIndex(
        (c) => c.title === concept.title,
      );

      await next({
        opacity: animatedIndex === concepts.length - 1 ? 1 : 0.15,
        transform: `translateY(${index * 20}px) scale(${0.9 + index * 0.05})`,
        maxHeight: '200px',
        padding: '20px',
      });
      if (concept.title) {
        animatedTitles.current.add(concept.title);
      }
    },
    config: {
      duration: 300,
      tension: 280,
      friction: 20,
    },
  });

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

  React.useEffect(() => {
    generateConcept(undefined, {
      onError: () => {
        const event = new CustomEvent('aucctus-generate-concept', {
          detail: { revert: true, error: true },
        });
        window.dispatchEvent(event);
      },
    });
  }, [generateConcept]);

  // UI Component renderers
  const renderLoadingText = () => (
    <div className='my-4 flex flex-col items-center justify-center gap-2'>
      <div
        style={getFadeInStyle(500, 500)}
        className='aucctus-text-white aucctus-text-lg'
      >
        Generating concepts
      </div>
      <div
        style={getFadeInStyle(500, 1000)}
        className='aucctus-text-white aucctus-text-xs'
      >
        This will take just a few seconds to complete
      </div>
    </div>
  );

  const renderConcepts = () =>
    transitions((style, concept) => (
      <animated.div
        style={{ ...style, transformOrigin: 'top' }}
        className='aucctus-border-primary aucctus-bg-primary absolute flex w-full flex-col gap-2 overflow-hidden rounded-lg border border-opacity-25 bg-opacity-[0.3] p-4'
      >
        <span className='aucctus-text-white aucctus-text-sm'>
          {concept.title}
        </span>
        <span className='aucctus-text-white aucctus-text-xs line-clamp-3 min-h-[4em]'>
          {concept.summary}
        </span>
      </animated.div>
    ));

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
            <LoadingIcon />
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
