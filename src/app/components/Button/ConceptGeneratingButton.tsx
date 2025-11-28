import { ComponentTooltip } from '@components';
import { ConceptReportStatusBySection } from '@libs/api/types';
import { FunctionComponent } from 'react';
import { animated, SpringValue } from 'react-spring';
import { ConceptStatusTooltip } from '../ToolTip/ConceptStatusTooltip';

type ConceptGeneratingButtonProps = {
  reportStatusBySection?: ConceptReportStatusBySection;
  dateReportStarted?: string;
  dateReportCompleted?: string;
  conceptUuid?: string;
  animationStyle?: {
    width?: SpringValue<string>;
    maxWidth?: SpringValue<string>;
  };
};

const ConceptGeneratingButton: FunctionComponent<
  ConceptGeneratingButtonProps
> = ({
  reportStatusBySection,
  dateReportStarted,
  dateReportCompleted,
  conceptUuid,
  animationStyle,
}) => {
  const ButtonComponent = animationStyle ? animated.button : 'button';

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
        style={animationStyle as any}
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
