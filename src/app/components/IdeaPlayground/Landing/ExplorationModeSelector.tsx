import React from 'react';
import { Icon } from '@components';
import { getAnimationStyle } from '@components/Card/ConceptGeneration/UserExploration/components/util/animation-keyframes';

interface ExplorationModeSelectorProps {
  currentTopic: string;
  /** Restart the playground from the beginning */
  onRestart: () => void;
  /** Close and navigate to concept bank */
  onClose: () => void;
  /** Whether to show the title bubble (hidden until LogoAnimation completes) */
  showTitle?: boolean;
}

const ExplorationModeSelector: React.FC<ExplorationModeSelectorProps> = ({
  currentTopic,
  onRestart,
  onClose,
  showTitle = true,
}) => {
  return (
    <div
      className='absolute left-0 right-0 top-4 z-40'
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className='text-center'
        style={getAnimationStyle('fadeIn', 500, 600)}
      >
        <div className='relative w-full'>
          {/* Title bubble - only shown when showTitle is true */}
          {showTitle && (
            <div className='relative flex justify-center'>
              <div
                className='group cursor-pointer'
                style={getAnimationStyle('scaleIn', 400, 100)}
              >
                <div className='flex h-12 items-center rounded-full border border-white/30 bg-white/15 px-4 py-3 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/40 hover:bg-white/20'>
                  <div className='flex items-center gap-3'>
                    <Icon
                      variant='lightbulb'
                      className='aucctus-stroke-warning-tertiary'
                      height={16}
                      width={16}
                    />
                    <span className='aucctus-text-sm-medium aucctus-text-white'>
                      {currentTopic}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right: Action Buttons */}
          <div
            className='absolute right-8 top-0 flex items-center gap-3'
            style={getAnimationStyle('scaleIn', 300, 500)}
          >
            <button
              onClick={onRestart}
              className='aucctus-text-white flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-white/15 p-3 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/70 hover:bg-white/20'
              title='Restart'
            >
              <Icon
                variant='refresh'
                className='aucctus-stroke-white'
                height={16}
                width={16}
              />
            </button>

            <button
              onClick={onClose}
              className='aucctus-text-white flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-white/15 p-3 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/70 hover:bg-white/20'
              title='Close'
            >
              <Icon
                variant='closeX'
                className='aucctus-stroke-white'
                height={16}
                width={16}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorationModeSelector;
