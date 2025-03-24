import { Badge, Icon } from '@components';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import React, { useMemo } from 'react';
import { animated, useTransition } from 'react-spring';
import IncubationIcon from '../util/IncubationIcon';
import ProgressCircle from '../util/ProgressCircle';

interface QuestionnaireHeaderProps {
  questionnaire?: IConceptIncubationQuestionnaireSection;
  onGoBack: () => void;
  onContinue: () => void;
  isQuestionAnswered: boolean;
  isRequired: boolean;
}

const formatHeaderName = (
  questionnaire?: IConceptIncubationQuestionnaireSection,
) =>
  questionnaire?.type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ') || '';

const QuestionnaireHeader: React.FC<QuestionnaireHeaderProps> = ({
  questionnaire,
  onGoBack,
  onContinue,
  isQuestionAnswered,
  isRequired,
}) => {
  const {
    currentStep,
    totalSteps,
    currentQuestionOrder,
    activeClarifyingQuestion,
    activeGeneratedConcept,
    activeQuestion,
  } = useConceptIncubationStore();

  const progressText = useMemo(() => {
    if (currentStep === Infinity) {
      return 'Complete';
    }
    return `${currentStep} / ${totalSteps} steps`;
  }, [currentStep, totalSteps]);

  const backButtonTransition = useTransition(
    !activeGeneratedConcept || activeClarifyingQuestion || activeQuestion,
    {
      from: { opacity: 0, maxWidth: '0px' },
      enter: { opacity: 1, maxWidth: '200px' },
      leave: { opacity: 0, maxWidth: '0px' },
      config: { tension: 100, friction: 12, mass: 0.5 },
    },
  );

  const buttonTransition = useTransition(
    currentQuestionOrder !== Infinity || activeClarifyingQuestion,
    {
      from: { opacity: 0, maxWidth: '0px' },
      enter: { opacity: 1, maxWidth: '200px' },
      leave: { opacity: 0, maxWidth: '0px' },
      config: { tension: 100, friction: 12, mass: 0.5 },
    },
  );

  const buttonText = useMemo(() => {
    return isQuestionAnswered || isRequired || currentQuestionOrder === Infinity
      ? 'Continue'
      : 'Skip';
  }, [isQuestionAnswered, isRequired, currentQuestionOrder]);

  return (
    <div className='relative z-[100] flex flex-row items-center'>
      <IncubationIcon variant='telescope' className='stroke-primary-800' />
      <span className='aucctus-text-xl-medium aucctus-text-primary ml-3'>
        {formatHeaderName(questionnaire)}
      </span>
      <Badge.Default
        value={'Draft'}
        classNameBadge='aucctus-border-secondary border items-center justify-center ml-3'
        classNameLabel='aucctus-text-secondary'
      />
      <div className='flex-1' />
      <ProgressCircle
        currentStep={currentStep}
        totalSteps={totalSteps}
        className='aucctus-border-brand border-4'
      />
      <span className='aucctus-text-sm-medium aucctus-text-secondary ml-3 w-20'>
        {progressText}
      </span>
      {backButtonTransition(
        (style, show) =>
          show && (
            <animated.span className='overflow-hidden' style={style}>
              <button
                className='btn btn-light mx-3 flex items-center gap-2'
                onClick={onGoBack}
              >
                <Icon variant='arrowleft' width={20} height={20} />
              </button>
            </animated.span>
          ),
      )}
      {buttonTransition(
        (style, show) =>
          show && (
            <animated.span className='overflow-hidden' style={style}>
              <button
                className='btn btn-primary flex items-center gap-2'
                onClick={onContinue}
                disabled={
                  !isQuestionAnswered &&
                  (isRequired || !!activeClarifyingQuestion)
                }
              >
                {buttonText}
              </button>
            </animated.span>
          ),
      )}
    </div>
  );
};

export default QuestionnaireHeader;
