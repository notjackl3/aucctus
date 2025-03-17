import React, { useCallback, useRef } from 'react';
import images from '@assets/img';
import { useConceptGeneration } from '@hooks/query/concepts.hook';
import { animated, easings, useSpring, useTransition } from '@react-spring/web';
import { Icon } from '@components';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import { IConcept } from '@libs/api/types/conceptIncubation';
import {
  animationStyles,
  getAnimationStyle,
} from '../UserExploration/components/util/animation-keyframes';

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
  const [concepts, setConcepts] = React.useState<IConcept[]>([]);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { mutate: generateConcept } = useConceptGeneration(draftSeedUuid);
  const animatedTitles = useRef<Set<string>>(new Set());
  const conceptsContainerRef = React.useRef<HTMLDivElement>(null);

  // Handle socket events for concept generation
  useSocketEvent('stream.structured.concept.generation', (data) => {
    const { concepts: eventConcepts } = data?.content;

    if (['done'].includes(data.stage) && eventConcepts) {
      setConcepts(eventConcepts);
      setTimeout(() => {
        handleGenerateComplete();
      }, 3000);
    } else if (['delta'].includes(data.stage) && eventConcepts) {
      if (eventConcepts.length - 1 > concepts.length) {
        setConcepts(eventConcepts.slice(0, -1));
      }
    }
  });

  // Animation configurations
  const floatingAnimation = useSpring({
    from: { transform: 'translateY(3px)' },
    to: { transform: 'translateY(-3px)' },
    config: {
      duration: 1500,
      easing: easings.easeInOutSine,
    },
    loop: { reverse: true },
  });

  const echoAnimation = useSpring({
    from: { transform: 'scale(1)', opacity: 0.3 },
    to: { transform: 'scale(2)', opacity: 0 },
    config: {
      duration: 1000,
      easing: easings.easeInOutSine,
    },
    loop: true,
    delay: 1000,
  });

  const conceptAnimated = useCallback((concept: IConcept) => {
    return !!concept.title && animatedTitles.current.has(concept.title);
  }, []);

  const transitions = useTransition(concepts, {
    from: (concept) => {
      const isAnimated = conceptAnimated(concept);
      const animatedIndex = concepts.findIndex(
        (c) => c.title === concept.title,
      );

      return {
        opacity: isAnimated ? 1 : 0,
        transform: isAnimated
          ? `translateY(${animatedIndex * 20}px) scale(${0.9 + animatedIndex * 0.05})`
          : 'translateY(0px) scale(1)',
        maxHeight: isAnimated ? '200px' : '0px',
        padding: isAnimated ? '20px' : '0px',
      };
    },
    enter: (concept, index) => async (next) => {
      await next({
        opacity: 1,
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

    conceptsContainer.childNodes.forEach((child, index) =>
      Object.assign(
        (child as HTMLElement).style,
        getFadeOutStyle(200, 100 * index),
      ),
    );

    setTimeout(() => Object.assign(content.style, getFadeOutStyle(300)), 1000);
    setTimeout(() => onGenerateComplete(), 1500);
  }, [onGenerateComplete]);

  // Start concept generation on component mount
  React.useEffect(() => {
    generateConcept(undefined, {
      onError: () => {
        const event = new CustomEvent('aucctus-generate-concept', {
          detail: { revert: true },
        });
        window.dispatchEvent(event);
      },
    });
  }, [generateConcept]);

  // UI Component renderers
  const renderLoadingIcon = () => (
    <>
      <animated.div
        className='aucctus-bg-primary-solid absolute rounded-lg border-[1.5px] border-primary-300 border-opacity-50 p-2'
        style={echoAnimation}
      >
        <Icon
          variant='ai-conclusion'
          className='stroke-primary-100 opacity-30'
          width={24}
          height={24}
        />
      </animated.div>
      <animated.div
        className='aucctus-bg-primary-solid rounded-lg border-[1.5px] border-primary-300 border-opacity-50 p-2'
        style={floatingAnimation}
      >
        <Icon
          variant='ai-conclusion'
          className='stroke-primary-100'
          width={24}
          height={24}
        />
      </animated.div>
    </>
  );

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
        className='aucctus-border-primary aucctus-bg-primary absolute flex w-full flex-col gap-2 overflow-hidden rounded-lg border border-opacity-25 bg-opacity-[0.1] p-4 backdrop-blur-md'
      >
        <span className='aucctus-text-white aucctus-text-sm'>
          {concept.title}
        </span>
        <span className='aucctus-text-white aucctus-text-xs line-clamp-3 min-h-[4em]'>
          {concept.description}
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
            {renderLoadingIcon()}
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
