import React, { useCallback } from 'react';
import images from '@assets/img';
import { useConceptGeneration } from '@hooks/query/concepts.hook';
import { animated, easings, useSpring, useTransition } from '@react-spring/web';
import { Icon } from '@components';

const animationStyles = `
  @keyframes moveBackground {
    0% {
      background-position: 0% 0%;
    }
    50% {
      background-position: 100% 100%;
    }
    100% {
      background-position: 0% 0%;
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;

const getFadeInStyle = (duration: number, delay: number = 0) => {
  return {
    opacity: 0,
    animation: `fadeIn ${duration}ms ease-in-out forwards`,
    animationDelay: `${delay}ms`,
  };
};

const getFadeOutStyle = (duration: number, delay: number = 0) => {
  return {
    opacity: 1,
    animation: `fadeOut ${duration}ms ease-in-out forwards`,
    animationDelay: `${delay}ms`,
  };
};

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
  const [concepts, setConcepts] = React.useState<any>([]);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { mutate: generateConcept } = useConceptGeneration();

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

  const transitions = useTransition(concepts, {
    from: {
      opacity: 0,
      transform: 'translateY(60px) scale(1.1)',
      maxHeight: '0px',
      padding: '0px',
    },
    enter: (_, index) => async (next) => {
      await next({
        opacity: 1,
        dummy: index,
        transform: `${`translateY(${index * 20}px) scale(${0.9 + index * 0.05})`}`,
        maxHeight: '200px',
        padding: '20px',
        delay: index * 2000,
      });

      if (index === concepts.length - 1) {
        setTimeout(() => {
          handleGenerateComplete();
        }, 2000);
      }
    },
    config: { duration: 300 },
  });

  // Handlers
  const handleGenerateComplete = useCallback(() => {
    const content = contentRef.current;
    if (!content) return;

    Object.assign(content.style, getFadeOutStyle(300));
    content.addEventListener(
      'animationend',
      () => {
        onGenerateComplete();
      },
      { once: true },
    );
  }, [onGenerateComplete]);

  // Effects
  React.useEffect(() => {
    generateConcept(
      {},
      {
        onSuccess: (data) => {
          setConcepts(data.concepts);
        },
        onError: () => {
          const event = new CustomEvent('aucctus-generate-concept', {
            detail: { revert: true },
          });
          window.dispatchEvent(event);
        },
      },
    );
  }, [generateConcept]);

  const renderLoadingIcon = () => {
    return (
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
  };

  const renderLoadingText = () => {
    return (
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
  };

  const renderConcepts = () => {
    return transitions((style, concept) => (
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
  };

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
          <span className='relative flex w-[50%] flex-1 flex-col'>
            {renderConcepts()}
          </span>
        </div>
      </div>
    </>
  );
});

ConceptGeneration.displayName = 'ConceptGeneration';

export default ConceptGeneration;
