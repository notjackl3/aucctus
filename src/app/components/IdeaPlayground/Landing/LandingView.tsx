import React from 'react';
import { animated } from 'react-spring';
import { Icon } from '@components';
import { getAnimationStyle } from '@components/Card/ConceptGeneration/UserExploration/components/util/animation-keyframes';

interface LandingViewProps {
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  style?: any;
}

const LandingView: React.FC<LandingViewProps> = ({
  inputValue,
  onInputChange,
  onKeyPress,
  style,
}) => {
  return (
    <animated.div
      style={style}
      className='pointer-events-none absolute inset-0 z-20 flex items-center justify-center'
    >
      <div className='relative'>
        <div className='relative z-20 space-y-6 px-6 text-center sm:px-8'>
          <div
            className='space-y-4'
            style={getAnimationStyle('fadeIn', 800, 300)}
          >
            <h1 className='aucctus-header-2xl-bold aucctus-text-white'>
              Idea Playground
            </h1>
            <p className='aucctus-text-xl aucctus-text-white opacity-80'>
              Where curiosity becomes innovation
            </p>
          </div>

          <div
            className='pointer-events-auto mx-auto w-full max-w-lg'
            style={getAnimationStyle('fadeIn', 800, 600)}
          >
            <div className='relative'>
              <input
                value={inputValue}
                onChange={onInputChange}
                onKeyPress={onKeyPress}
                placeholder='Describe a problem, idea or focus area on your mind'
                className='aucctus-text-md shadow-glass aucctus-text-white w-full rounded-3xl border border-white/20 bg-white/10 py-6 pl-8 pr-16 backdrop-blur-md transition-all duration-300 placeholder:text-white/60 focus:border-white/40 focus:bg-white/20'
              />
              <Icon
                variant='lightbulb'
                className='aucctus-stroke-white absolute right-6 top-1/2 -translate-y-1/2 transform opacity-60'
                height={24}
                width={24}
              />
            </div>
          </div>

          <div style={getAnimationStyle('fadeIn', 800, 1500)}>
            <p className='aucctus-text-xl aucctus-text-white opacity-60'>
              Start typing to begin exploring...
            </p>
          </div>
        </div>
      </div>
    </animated.div>
  );
};

export default LandingView;
