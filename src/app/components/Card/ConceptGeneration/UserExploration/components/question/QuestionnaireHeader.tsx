import React from 'react';
import { Badge, Icon } from '@components';
import IncubationIcon from '../util/IncubationIcon';
import ProgressCircle from '../util/ProgressCircle';
import { QuestionnaireSection } from '@pages/Concept/Ignition/IncubateConcept';
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

  const { currentStep, totalSteps } = useConceptIncubationStore();

  return (
    <div className='relative z-[10] flex flex-row items-center gap-3'>
      <IncubationIcon variant='telescope' className='stroke-primary-800' />
      <span className='aucctus-text-xl-medium aucctus-text-primary'>
        {formatHeaderName(questionnaire)}
      </span>
      <Badge.Default
        value={'Draft'}
        classNameBadge='aucctus-border-secondary border items-center justify-center'
        classNameLabel='aucctus-text-secondary'
      />
      {renderSpacer()}
      <ProgressCircle
        currentStep={currentStep}
        totalSteps={totalSteps}
        className='aucctus-border-brand border-4'
      />
      <span className='aucctus-text-sm-medium aucctus-text-secondary w-20'>
        {currentStep} / {totalSteps} steps
      </span>
      <button
        className='btn btn-light flex items-center gap-2'
        onClick={onGoBack}
      >
        <Icon variant='arrowleft' width={20} height={20} />
      </button>
      <button
        className='btn btn-primary flex items-center gap-2'
        onClick={onContinue}
        disabled={!isQuestionAnswered && isRequired}
      >
        {isQuestionAnswered || isRequired ? 'Continue' : 'Skip'}
      </button>
    </div>
  );
};

export default QuestionnaireHeader;
