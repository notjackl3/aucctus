import { ConceptReportStatusBySection } from '@libs/api/types';
import { FunctionComponent } from 'react';
import { Icon, Card } from '@components';
import { cn } from '@libs/utils/react';
import Progress from '../Loading/Progress';
import useGenerationStatus from '@hooks/concepts/generation-status.hook';

// Friendly names for section keys
const SECTION_NAMES: Record<string, string> = {
  marketScan: 'Market Scan',
  trends: 'Trends',
  customerProfiles: 'Customer Profiles',
  financialProjection: 'Financial Projection',
  assumptions: 'Key Assumptions',
  overview: 'Overview',
};

const formatDuration = (startDateStr: string, endDateStr?: string) => {
  if (!startDateStr) return '';

  try {
    const startDate = new Date(startDateStr).getTime();
    const endDate = endDateStr ? new Date(endDateStr).getTime() : Date.now();
    const durationMs = endDate - startDate;
    const totalSeconds = Math.floor(durationMs / 1000);

    // If the duration is less than 10 seconds and we have an explicit end date (completed section),
    // display the simplified label
    if (totalSeconds < 10 && !!endDateStr) {
      return '<10s';
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  } catch (e) {
    return '';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'complete':
      return (
        <Icon
          variant='check'
          width={20}
          height={20}
          className='stroke-success-600'
        />
      );
    case 'pending':
      return (
        <Icon
          variant='clock-stopwatch'
          width={20}
          height={20}
          className='stroke-warning-600'
        />
      );
    case 'error':
      return (
        <Icon
          variant='alert-circle'
          width={20}
          height={20}
          className='stroke-error-600'
        />
      );
    default:
      return (
        <Icon
          variant='clock'
          width={20}
          height={20}
          className='stroke-gray-light-500'
        />
      );
  }
};

interface ConceptStatusTooltipProps {
  reportStatusBySection?: ConceptReportStatusBySection;
  dateReportStarted?: string;
  dateReportCompleted?: string;
}

const ConceptStatusTooltip: FunctionComponent<ConceptStatusTooltipProps> = ({
  reportStatusBySection,
  dateReportStarted,
  dateReportCompleted,
}) => {
  const { progressPercentage } = useGenerationStatus(reportStatusBySection);

  return (
    <Card.Detail
      cardClassName={cn(
        'shadow-lg',
        'aucctus-bg-primary border aucctus-border-secondary rounded-xl p-3',
      )}
      headerClassName='aucctus-bg-primary border-b aucctus-border-secondary'
      title='Concept Generation Status'
      isHideFooter={true}
    >
      <div className='flex w-full flex-col'>
        {Object.keys(SECTION_NAMES)
          .filter(
            (sectionKey) =>
              reportStatusBySection && sectionKey in reportStatusBySection,
          )
          .map((sectionKey) => {
            const section = reportStatusBySection?.[sectionKey];
            if (!section) return null;

            return (
              <div key={sectionKey} className='mb-1 w-full'>
                <div className='flex items-center justify-between rounded p-2'>
                  <div className='flex items-center gap-2'>
                    {getStatusIcon(section.status)}
                    <span className='aucctus-text-md'>
                      {SECTION_NAMES[sectionKey] || sectionKey}
                    </span>
                  </div>
                  <div className='aucctus-text-xs aucctus-text-secondary'>
                    {section.status === 'complete' &&
                    section.dateStarted &&
                    section.dateCompleted ? (
                      <span>
                        Took{' '}
                        {formatDuration(
                          section.dateStarted,
                          section.dateCompleted,
                        )}
                      </span>
                    ) : section.status === 'complete' ? (
                      <></>
                    ) : section.status === 'error' ? (
                      <></>
                    ) : section.dateStarted ? (
                      <span>
                        Running for {formatDuration(section.dateStarted)}
                      </span>
                    ) : (
                      <span>Pending</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

        <div className='mt-3'>
          <div className='relative h-6'>
            <Progress progress={progressPercentage} />
          </div>

          <div className='mt-2 flex justify-between'>
            <span className='aucctus-text-md'>{progressPercentage}%</span>
            <div className='aucctus-text-sm aucctus-text-secondary'>
              {dateReportStarted && dateReportCompleted && (
                <span>
                  Took {formatDuration(dateReportStarted, dateReportCompleted)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card.Detail>
  );
};

export { ConceptStatusTooltip };
