import React, { useCallback } from 'react';
import images from '@assets/img';
import { useConceptGeneration } from '@hooks/query/concepts.hook';
import { animated, easings, useSpring, useTransition } from '@react-spring/web';
import { Icon } from '@components';

type keyframes = 'moveBackground' | 'fadeScaleIn' | 'fadeIn' | 'fadeOut';

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

  @keyframes fadeScaleIn {
    from { opacity: 0; transform: scale(0); }
    to { opacity: 1; transform: scale(1); }
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

const initialAnimationStyleMap: Record<keyframes, React.CSSProperties> = {
  fadeScaleIn: {
    opacity: 0,
    transform: 'scale(0)',
  },
  fadeIn: {
    opacity: 0,
  },
  fadeOut: {
    opacity: 1,
  },
  moveBackground: {},
};

const getAnimationStyle = (
  animation: keyframes,
  duration: number,
  delay: number = 0,
) => {
  return {
    ...initialAnimationStyleMap[animation],
    animation: `${animation} ${duration}ms ease-out forwards`,
    animationDelay: `${delay}ms`,
  };
};

const mainStyle = {
  backgroundImage: `url(${images.aiExplorationsBackground})`,
  backgroundSize: 'cover',
  animation: 'moveBackground 30s ease infinite',
};

interface ConceptSelectionProps {
  className?: string;
}

const ConceptSelection: React.FC<ConceptSelectionProps> = ({
  className = '',
}) => {
  return (
    <>
      <style>{animationStyles}</style>
      <div className={className} style={mainStyle}>
        <div
          style={getAnimationStyle('fadeScaleIn', 1000)}
          className='aucctus-bg-tertiary m-8 flex flex-1 flex-row items-center justify-center rounded-xl rounded-xl'
        >
          <div className='aucctus-bg-primary aucctus-border-brand flex items-center justify-center rounded-xl border-2 p-4'>
            Coming Soon
          </div>
        </div>
      </div>
    </>
  );
};

export default ConceptSelection;
