import React, { useCallback } from 'react';
import { Badge, Icon } from '@components';
import { useTransition, animated } from 'react-spring';
import IncubationIcon from '../util/IncubationIcon';
import ProgressCircle from '../util/ProgressCircle';
import { QuestionnaireSection } from '@pages/Concept/Incubation/IncubateConcept';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';

interface QuestionnaireHeaderProps {
  questionnaire?: QuestionnaireSection;
  onGoBack: () => void;
  onContinue: () => void;
  isQuestionAnswered: boolean;
  isRequired: boolean;
}

const formatHeaderName = (questionnaire?: QuestionnaireSection) =>
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
  const renderSpacer = () => <div className='flex-1' />;

  const { currentStep, totalSteps, currentQuestionOrder } =
    useConceptIncubationStore();

  const getProgressText = useCallback(() => {
    if (currentStep === Infinity) {
      return 'Complete';
    }
    return `${currentStep} / ${totalSteps} steps`;
  }, [currentStep, totalSteps]);

  const buttonTransition = useTransition(currentQuestionOrder !== Infinity, {
    from: { opacity: 0, maxWidth: '0px' },
    enter: { opacity: 1, maxWidth: '200px' },
    leave: { opacity: 0, maxWidth: '0px' },
    config: { tension: 100, friction: 12, mass: 0.5 },
  });

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
      {renderSpacer()}
      <ProgressCircle
        currentStep={currentStep}
        totalSteps={totalSteps}
        className='aucctus-border-brand border-4'
      />
      <span className='aucctus-text-sm-medium aucctus-text-secondary ml-3 w-20'>
        {getProgressText()}
      </span>
      <button
        className='btn btn-light mx-3 flex items-center gap-2'
        onClick={onGoBack}
      >
        <Icon variant='arrowleft' width={20} height={20} />
      </button>
      {buttonTransition(
        (style, show) =>
          show && (
            <animated.span className='overflow-hidden' style={style}>
              <button
                className='btn btn-primary flex items-center gap-2'
                onClick={onContinue}
                disabled={!isQuestionAnswered && isRequired}
              >
                {isQuestionAnswered ||
                isRequired ||
                currentQuestionOrder === Infinity
                  ? 'Continue'
                  : 'Skip'}
              </button>
            </animated.span>
          ),
      )}
    </div>
  );
};

export default QuestionnaireHeader;
