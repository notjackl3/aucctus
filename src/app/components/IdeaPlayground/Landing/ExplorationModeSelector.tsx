import React from 'react';
import { animated } from 'react-spring';
import { Icon } from '@components';
import { getAnimationStyle } from '@components/Card/ConceptGeneration/UserExploration/components/util/animation-keyframes';

interface ExplorationModeSelectorProps {
  currentTopic: string;
  explorationMode: string;
  explorationModes: string[];
  showDropdown: boolean;
  dropdownTransition: any;
  onExplorationModeChange: (mode: string) => void;
  onDropdownToggle: () => void;
  onRestart: () => void;
}

const ExplorationModeSelector: React.FC<ExplorationModeSelectorProps> = ({
  currentTopic,
  explorationMode,
  explorationModes,
  showDropdown,
  dropdownTransition,
  onExplorationModeChange,
  onDropdownToggle,
  onRestart,
}) => {
  return (
    <div className='absolute left-0 right-0 top-4 z-40'>
      <div
        className='text-center'
        style={getAnimationStyle('fadeIn', 500, 600)}
      >
        <p className='aucctus-text-md aucctus-text-white mb-4 opacity-70'>
          Sounds Like You Want To
        </p>

        <div className='relative w-full'>
          {/* Left: Anchor Pill */}
          <div
            className='group absolute left-8 top-0 cursor-pointer'
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

          {/* Center: Exploration Mode Selector */}
          <div className='relative flex justify-center'>
            <button
              onClick={onDropdownToggle}
              className='aucctus-text-lg-semibold aucctus-text-white flex h-12 min-w-max items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/30 bg-white/15 px-5 py-3 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/40 hover:bg-white/20 focus:outline-none'
            >
              <span>{explorationMode}</span>
              <Icon
                variant='chevrondown'
                className='aucctus-stroke-white transition-transform duration-200'
                height={16}
                width={16}
                style={{
                  transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownTransition(
              (dropdownStyle: any, dropdownItem: boolean) =>
                dropdownItem && (
                  <animated.div
                    style={dropdownStyle}
                    className='absolute left-1/2 top-full z-50 mt-2 w-80 -translate-x-1/2 transform overflow-hidden rounded-xl border border-white/30 bg-white/95 shadow-2xl backdrop-blur-md'
                  >
                    {explorationModes.map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          onExplorationModeChange(mode);
                        }}
                        className='aucctus-text-primary aucctus-text-md-medium w-full border-b border-white/20 px-6 py-4 text-left capitalize transition-colors duration-200 last:border-b-0 hover:bg-white/50'
                      >
                        {mode}
                      </button>
                    ))}
                  </animated.div>
                ),
            )}
          </div>

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
              onClick={onRestart}
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
