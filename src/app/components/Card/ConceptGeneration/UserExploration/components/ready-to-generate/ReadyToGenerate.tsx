import React, { useMemo } from 'react';
import { CompletionIcon } from '../question/CompletionIcon';
import { animated } from '@react-spring/web';
import { useReadyToGenerateAnimations } from './ready-to-generate-animation.hook';
import images from '@assets/img';
import AucctusImg from '@components/Image/AucctusImg';
import { IGeneratedConcept } from '@libs/api/types';
import { cn } from '@libs/utils/react';

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
  concept?: IGeneratedConcept;
  compact?: boolean;
  onMouseEnter?: () => void;
  onGenerate?: () => void;
}

const READY_TO_GENERATE_TEXT =
  'Aucctus is ready to generate some concepts on the right, based on your answers or you can refine some of your answers, note that the more questions and accurate your answers, the better Aucctus can help generate the concepts for you.';

const ReadyToGenerate: React.FC<ReadyToGenerateProps> = ({
  concept = undefined,
  compact = false,
  onGenerate = () => {},
  onMouseEnter = () => {},
}) => {
  const {
    iconAnimation,
    labelAnimation,
    cardAnimation,
    headerButtonAnimation,
  } = useReadyToGenerateAnimations(compact && !concept);

  const headerMessage = useMemo(() => {
    if (concept) {
      return concept.isGenerating
        ? 'Report generation is in progress'
        : `Your concept report is ready to be generated`;
    } else {
      return 'Your concepts are ready to be generated';
    }
  }, [concept]);
  const buttonText = useMemo(
    () => (concept ? 'Generate Report' : 'Generate'),
    [concept],
  );
  const cardHeaderText = useMemo(
    () => (concept ? concept.title : 'Generate Concepts'),
    [concept],
  );
  const cardText = useMemo(
    () => (concept ? concept.summary : READY_TO_GENERATE_TEXT),
    [concept],
  );

  return (
    <span className='z-[999] mt-4 flex flex-col gap-4'>
      <animated.span
        style={iconAnimation}
        className='flex flex-row items-center gap-2'
      >
        <ReadyToGenerateIcon />
        <animated.span
          onMouseEnter={onMouseEnter}
          style={labelAnimation}
          className='aucctus-text-primary cursor-pointer'
        >
          {headerMessage}
        </animated.span>
        <span className='flex flex-1'></span>
        <animated.span
          style={headerButtonAnimation}
          className={cn('aucctus-text-primary mr-2', {
            'pointer-events-none': !compact,
          })}
        >
          <button
            className='btn btn-primary'
            onClick={() =>
              window.dispatchEvent(new CustomEvent('aucctus-generate-concept'))
            }
          >
            {buttonText}
          </button>
        </animated.span>
      </animated.span>
      <animated.span style={cardAnimation} className='flex flex-row gap-2'>
        <div className='aucctus-bg-primary aucctus-border-primary flex w-full flex-row gap-2 rounded-xl border-2 p-4'>
          <div
            className={cn('flex-grow-3 flex flex-col gap-2', {
              'w-[60%]': !concept,
              'w-[100%]': concept,
            })}
          >
            <span className='aucctus-text-secondary aucctus-text-lg-medium'>
              {cardHeaderText}
            </span>
            <span className='aucctus-text-secondary aucctus-text-sm'>
              {cardText}
            </span>
            <span className='flex flex-1'></span>
            {!concept?.isGenerating && (
              <button
                className='btn btn-primary self-start'
                onClick={onGenerate}
              >
                {buttonText}
              </button>
            )}
          </div>
          {!concept && (
            <div className='flex w-[40%] flex-col items-center justify-center gap-2'>
              <AucctusImg
                src={images.readyToGenerateGradient}
                className='w-full'
              />
            </div>
          )}
        </div>
      </animated.span>
    </span>
  );
};

export default ReadyToGenerate;
