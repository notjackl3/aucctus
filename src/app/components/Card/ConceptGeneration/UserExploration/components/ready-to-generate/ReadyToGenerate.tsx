import React, { useMemo } from 'react';
import { CompletionIcon } from '../question/CompletionIcon';
import { animated } from '@react-spring/web';
import { useReadyToGenerateAnimations } from './ready-to-generate-animation.hook';
import images from '@assets/img';
import AucctusImg from '@components/Image/AucctusImg';
import { IGeneratedConcept } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import { useSeed } from '@hooks/query/concepts.hook';
import { useSearchParams } from 'react-router-dom';

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

const EXPAND_IDEA_TEXT =
  'Aucctus is ready to help validate and expand your idea. Based on your answers, we can generate concepts that build upon your existing idea.';

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

  const [searchParams] = useSearchParams();
  const seedUuid = searchParams.get('seed') || undefined;

  const { activeQuestionnaire } = useConceptIncubationStore();

  // Fetch seed data to check for cached concepts
  const { data: seedDraftData } = useSeed(seedUuid, { status: 'draft' });

  // Check if we have cached concepts for this seed
  const hasCachedConcepts = useMemo(() => {
    return (
      seedDraftData?.cachedConcepts &&
      Array.isArray(seedDraftData.cachedConcepts) &&
      seedDraftData.cachedConcepts.length > 0
    );
  }, [seedDraftData]);

  const handleButtonClick = () => {
    if (hasCachedConcepts) {
      // If we have cached concepts, go directly to selection
      window.dispatchEvent(
        new CustomEvent('aucctus-generate-concept', {
          detail: { viewCachedConcepts: true },
        }),
      );
    } else {
      // Normal generation flow
      window.dispatchEvent(new CustomEvent('aucctus-generate-concept'));
    }
  };

  const headerMessage = useMemo(() => {
    if (concept) {
      return concept.isGenerating
        ? 'Report generation is in progress'
        : `We have enough information to generate your concept report`;
    } else {
      return activeQuestionnaire?.type === 'EXPAND_AN_EXISTING_IDEA'
        ? 'We have enough information to validate and expand your idea'
        : 'We have enough information to generate concepts for you';
    }
  }, [concept, activeQuestionnaire]);

  const buttonText = useMemo(() => {
    if (concept) return 'Generate Report';
    if (hasCachedConcepts) return 'View Concepts';
    return 'Generate';
  }, [concept, hasCachedConcepts]);

  const cardHeaderText = useMemo(
    () => (concept ? concept.title : 'Generate Concepts'),
    [concept],
  );

  const cardText = useMemo(() => {
    if (concept) return concept.summary;
    return activeQuestionnaire?.type === 'EXPAND_AN_EXISTING_IDEA'
      ? EXPAND_IDEA_TEXT
      : READY_TO_GENERATE_TEXT;
  }, [concept, activeQuestionnaire]);

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
          <button className='btn btn-primary' onClick={handleButtonClick}>
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
                onClick={hasCachedConcepts ? handleButtonClick : onGenerate}
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
