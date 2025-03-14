import { animated } from '@react-spring/web';
import React from 'react';
import { useContinueRefiningAnimations } from './continue-refining-animation.hook';
import { CompletionIcon } from '../question/CompletionIcon';

interface ContinueRefiningProps {
  iconRef: React.RefObject<HTMLSpanElement>;
}

const ContinueRefiningIcon: React.FC<ContinueRefiningProps> = ({ iconRef }) => {
  return (
    <span className='relative' ref={iconRef}>
      <CompletionIcon
        variant='compass-03'
        className='aucctus-bg-primary ml-1 h-10 w-10'
      />
    </span>
  );
};

interface ContinueRefiningProps {
  iconRef: React.RefObject<HTMLSpanElement>;
}

const ContinueRefining: React.FC<ContinueRefiningProps> = ({ iconRef }) => {
  const { iconAnimation, labelAnimation, cardAnimation } =
    useContinueRefiningAnimations();

  return (
    <span className='z-[999] flex flex-col gap-4'>
      <animated.span
        style={iconAnimation}
        className='flex flex-row items-center gap-2'
      >
        <ContinueRefiningIcon iconRef={iconRef} />
        <animated.span style={labelAnimation} className='aucctus-text-primary'>
          {'Continue refining concept direction'}
        </animated.span>
      </animated.span>
      <animated.span style={cardAnimation} className='flex flex-row gap-2'>
        <div className='aucctus-bg-primary aucctus-border-primary flex w-full flex-row items-center justify-center gap-2 rounded-xl border-2 p-4'>
          <span className='aucctus-text-secondary aucctus-text-lg-medium'>
            Coming soon
          </span>
        </div>
      </animated.span>
    </span>
  );
};

export default ContinueRefining;
