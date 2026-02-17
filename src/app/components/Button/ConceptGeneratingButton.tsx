import { ComponentTooltip } from '@components';
import { ConceptReportStatusBySection } from '@libs/api/types';
import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { ConceptStatusTooltip } from '../ToolTip/ConceptStatusTooltip';

type ConceptGeneratingButtonProps = {
  reportStatusBySection?: ConceptReportStatusBySection;
  dateReportStarted?: string;
  dateReportCompleted?: string;
  conceptUuid?: string;
  animatedMaxWidth?: string;
};

const ConceptGeneratingButton: FunctionComponent<
  ConceptGeneratingButtonProps
> = ({
  reportStatusBySection,
  dateReportStarted,
  dateReportCompleted,
  conceptUuid,
  animatedMaxWidth,
}) => {
  const ButtonComponent = animatedMaxWidth ? motion.button : 'button';

  const motionProps = animatedMaxWidth
    ? {
        initial: false as const,
        animate: { maxWidth: animatedMaxWidth },
        transition: { type: 'spring' as const, stiffness: 280, damping: 60 },
      }
    : {};

  return (
    <ComponentTooltip
      tip={
        reportStatusBySection && (
          <ConceptStatusTooltip
            reportStatusBySection={reportStatusBySection}
            dateReportStarted={dateReportStarted}
            dateReportCompleted={dateReportCompleted}
            conceptUuid={conceptUuid}
          />
        )
      }
      hideDelay={0}
    >
      <ButtonComponent
        className='btn btn-generating btn-bold btn-sm'
        disabled
        {...motionProps}
      >
        <span className='flex'>
          {'Generating'.split('').map((letter, index) => (
            <span
              key={index}
              className='letter-bounce'
              style={{
                animationDelay: `${index * 30}ms`,
              }}
            >
              {letter}
            </span>
          ))}
        </span>
      </ButtonComponent>
    </ComponentTooltip>
  );
};

export default ConceptGeneratingButton;
