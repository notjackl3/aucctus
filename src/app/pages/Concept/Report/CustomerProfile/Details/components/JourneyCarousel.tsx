import React from 'react';
import { ComponentCarousel } from '@components';
import { IUserJourneyStep } from '@libs/api/types';
import StepCard from './StepCard';

interface JourneyCarouselProps {
  steps: IUserJourneyStep[];
  editable?: boolean;
  onEdit: (step: IUserJourneyStep) => void;
  onRemove: (index: number) => void;
  productName?: string;
  painPointLabel?: string;
  jobLabel?: string;
  interventionLabel?: string;
  relationTypes?: Record<string, string>;
}

const JourneyCarousel: React.FC<JourneyCarouselProps> = ({
  steps,
  editable = false,
  onEdit,
  onRemove,
  productName,
  painPointLabel = 'Pain Point',
  jobLabel = 'Job to be Done',
  interventionLabel = 'Moment of Intervention',
  relationTypes,
}) => {
  const interventionIndex = steps.findIndex(
    (step) =>
      relationTypes &&
      step.relationType === relationTypes.MOMENT_OF_INTERVENTION,
  );

  return (
    <ComponentCarousel
      cardWidth='240px'
      gap='16px'
      showNavigation={true}
      autoScrollToCenter={interventionIndex >= 0}
      centerIndex={interventionIndex}
      className='mt-6'
    >
      {steps.map((step, index) => (
        <StepCard
          key={step.uuid || index}
          step={step}
          index={index}
          totalSteps={steps.length}
          editable={editable}
          onEdit={() => onEdit(step)}
          onRemove={() => onRemove(index)}
          productName={productName}
          painPointLabel={painPointLabel}
          jobLabel={jobLabel}
          interventionLabel={interventionLabel}
          relationTypes={relationTypes}
        />
      ))}
    </ComponentCarousel>
  );
};

export default React.memo(JourneyCarousel);
