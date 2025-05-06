import React, { useRef, useEffect, useState } from 'react';
import { Icon } from '@components';
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

const ICON_COLOR = 'aucctus-stroke-brand-secondary';

// Component styles
const carouselStyles = 'scrollbar-hide flex w-full overflow-x-auto py-4 pl-4';
const stepCardContainerStyles =
  'relative ml-0 flex-shrink-0 basis-[240px] pr-4 pt-6';
const navButtonStyles =
  'aucctus-bg-secondary-hover flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-50';
const navContainerStyles = 'mt-4 flex justify-end gap-2';

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
  const carouselRef = useRef<HTMLDivElement>(null);
  const interventionIndex = steps.findIndex(
    (step) =>
      relationTypes &&
      step.relationType === relationTypes.MOMENT_OF_INTERVENTION,
  );
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  useEffect(() => {
    const updateScrollLimits = () => {
      if (carouselRef.current) {
        const containerWidth = carouselRef.current.clientWidth;
        const scrollWidth = carouselRef.current.scrollWidth;
        setMaxScroll(scrollWidth - containerWidth);
      }
    };

    updateScrollLimits();
    window.addEventListener('resize', updateScrollLimits);

    return () => {
      window.removeEventListener('resize', updateScrollLimits);
    };
  }, [steps]);

  useEffect(() => {
    if (carouselRef.current && interventionIndex >= 0) {
      setTimeout(() => {
        if (carouselRef.current) {
          const carousel = carouselRef.current;
          const cards = carousel.querySelectorAll('[data-step-card]');

          if (cards.length > 0 && interventionIndex < cards.length) {
            const targetCard = cards[interventionIndex] as HTMLElement;
            const containerWidth = carousel.clientWidth;
            const cardWidth = targetCard.offsetWidth;
            const targetPosition = targetCard.offsetLeft;

            const newScrollPosition =
              targetPosition - containerWidth / 2 + cardWidth / 2;

            carousel.scrollTo({
              left: newScrollPosition,
              behavior: 'smooth',
            });

            setScrollPosition(newScrollPosition);
          }
        }
      }, 100);
    }
  }, [interventionIndex, steps]);

  const handleScroll = () => {
    if (carouselRef.current) {
      setScrollPosition(carouselRef.current.scrollLeft);
    }
  };

  const scrollPrev = () => {
    if (carouselRef.current) {
      const newScrollPosition = Math.max(0, scrollPosition - 250);
      carouselRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth',
      });
    }
  };

  const scrollNext = () => {
    if (carouselRef.current) {
      const newScrollPosition = Math.min(maxScroll, scrollPosition + 250);
      carouselRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className='relative mt-6'>
      <div className='w-full'>
        <div
          ref={carouselRef}
          className={carouselStyles}
          onScroll={handleScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Line behind the cards. Uncomment if we need to annoy Vincent */}
          {/* <div className='aucctus-bg-secondary absolute left-6 right-6 top-1/2 z-0 h-[2px] -translate-y-1/2'></div> */}

          {steps.map((step, index) => (
            <div
              key={step.uuid || index}
              className={stepCardContainerStyles}
              data-step-card
            >
              <StepCard
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
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        <div className={navContainerStyles}>
          <button
            className={navButtonStyles}
            onClick={scrollPrev}
            disabled={scrollPosition <= 0}
          >
            <Icon
              variant='arrowleft'
              height={16}
              width={16}
              className={ICON_COLOR}
            />
          </button>
          <button
            className={navButtonStyles}
            onClick={scrollNext}
            disabled={scrollPosition >= maxScroll}
          >
            <Icon
              variant='arrowright'
              height={16}
              width={16}
              className={ICON_COLOR}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(JourneyCarousel);
