import React from 'react';
import { CompletionIcon } from '../question/CompletionIcon';
import { animated } from '@react-spring/web';
import { useReadyToGenerateAnimations } from './ready-to-generate-animation.hook';
import images from '@assets/img';
import AucctusImg from '@components/Image/AucctusImg';

const ReadyToGenerateIcon: React.FC = () => {
  return (
    <span className='relative'>
      <CompletionIcon
        variant='rocket'
        className='aucctus-bg-primary ml-1 h-10 w-10'
      />
    </span>
  );
};

interface ReadyToGenerateProps {
  compact?: boolean;
}

const READY_TO_GENERATE_TEXT =
  'Aucctus is ready to generate some concepts on the right, based on your answers or you can refine some of your answers, note that the more questions and accurate your answers, the better Aucctus can help generate the concepts for you.';

const ReadyToGenerate: React.FC<ReadyToGenerateProps> = ({
  compact = false,
}) => {
  const {
    iconAnimation,
    labelAnimation,
    cardAnimation,
    headerButtonAnimation,
  } = useReadyToGenerateAnimations(compact);

  return (
    <span className='z-[999] mt-4 flex flex-col gap-4'>
      <animated.span
        style={iconAnimation}
        className='flex flex-row items-center gap-2'
      >
        <ReadyToGenerateIcon />
        <animated.span style={labelAnimation} className='aucctus-text-primary'>
          {'Your concepts are ready to be generated'}
        </animated.span>
        <span className='flex flex-1'></span>
        <animated.span
          style={headerButtonAnimation}
          className='aucctus-text-primary mr-2'
        >
          <button
            className='btn btn-primary'
            onClick={() =>
              window.dispatchEvent(new CustomEvent('aucctus-generate-concept'))
            }
          >
            Generate
          </button>
        </animated.span>
      </animated.span>
      <animated.span style={cardAnimation} className='flex flex-row gap-2'>
        <div className='aucctus-bg-primary aucctus-border-primary flex w-full flex-row gap-2 rounded-xl border-2 p-4'>
          <div className='flex-grow-3 flex w-[60%] flex-col gap-2'>
            <span className='aucctus-text-secondary aucctus-text-lg-medium'>
              Generate Concepts
            </span>
            <span className='aucctus-text-secondary aucctus-text-sm'>
              {READY_TO_GENERATE_TEXT}
            </span>
            <span className='flex flex-1'></span>
            <button
              className='btn btn-primary self-start'
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('aucctus-generate-concept'),
                )
              }
            >
              Generate
            </button>
          </div>
          <div className='flex w-[40%] flex-col items-center justify-center gap-2'>
            <AucctusImg
              src={images.readyToGenerateGradient}
              className='w-full'
            />
          </div>
        </div>
      </animated.span>
    </span>
  );
};

export default ReadyToGenerate;
