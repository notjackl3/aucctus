import React from 'react';
import { Icon, Container } from '@components';
import { ICustomerJob } from '@libs/api/types';

/**
 * Props for AiInsight component.
 * @param topJob The highest priority job (ICustomerJob)
 * @param insightExpanded Whether the insight section is expanded
 * @param setInsightExpanded Function to toggle the expanded state
 * @param textColorClass Optional class for customizing the label text color
 * @param iconStrokeClass Optional class for customizing the icon stroke color
 */
interface AiInsightProps {
  topJob: ICustomerJob;
  insightExpanded: boolean;
  setInsightExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  textColorClass?: string;
  iconStrokeClass?: string;
}

const AiInsight: React.FC<AiInsightProps> = ({
  topJob,
  insightExpanded,
  setInsightExpanded,
  textColorClass = 'aucctus-text-brand-primary',
  iconStrokeClass = 'aucctus-stroke-brand-primary',
}) => (
  <div className='aucctus-border-secondary-subtle mt-2 border-t pt-2'>
    <button
      className={`${textColorClass} flex w-full items-center justify-between py-1.5`}
      onClick={() => setInsightExpanded((prev) => !prev)}
    >
      <div className='flex items-center gap-2'>
        <span className='aucctus-bg-primary aucctus-border-secondary flex h-6 w-6 items-center justify-center rounded-lg border-2'>
          <Icon
            variant='ai-conclusion'
            height={14}
            width={14}
            className={iconStrokeClass}
          />
        </span>
        <span className={`${textColorClass} aucctus-text-xs-medium`}>
          AUCCTUS INSIGHT
        </span>
      </div>
      <Icon
        variant={insightExpanded ? 'chevronup' : 'chevrondown'}
        height={12}
        width={12}
        className={iconStrokeClass}
      />
    </button>
    <Container.Collapsible open={insightExpanded}>
      <div className='px-2 py-2'>
        <p className='aucctus-text-secondary aucctus-text-sm'>
          {`This job ranks highest with a priority score of ${topJob.order || 0}/10 as it represents \
                  the core daily challenge that directly impacts the user's routine and productivity.`}
        </p>
      </div>
    </Container.Collapsible>
  </div>
);

export default React.memo(AiInsight);
