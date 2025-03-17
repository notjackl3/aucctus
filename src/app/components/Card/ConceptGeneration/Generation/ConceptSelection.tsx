import React from 'react';
import images from '@assets/img';
import {
  animationStyles,
  getAnimationStyle,
} from '../UserExploration/components/util/animation-keyframes';

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
