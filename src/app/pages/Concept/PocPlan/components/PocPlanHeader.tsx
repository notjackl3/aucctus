import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Icon } from '@components';
import { IConcept, IPocPlan } from '@libs/api/types';
import { cn } from '@libs/utils/react';

interface IPocPlanHeaderProps {
  concept: IConcept;
  pocPlan: IPocPlan;
}

// Format Go/No-Go date for display
const formatGoNoGoDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Generate Google Calendar URL for Go/No-Go decision meeting
const generateGoogleCalendarUrl = (
  dateString: string,
  conceptTitle: string,
): string => {
  const date = new Date(dateString);
  // Format date as YYYYMMDD for Google Calendar
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateFormatted = `${year}${month}${day}`;

  const title = encodeURIComponent(`Go/No-Go Decision: ${conceptTitle}`);
  const details = encodeURIComponent(
    `POC Go/No-Go decision meeting for "${conceptTitle}".\n\nReview success metrics and make final determination on whether to proceed with full implementation.`,
  );

  // All-day event format: dates=YYYYMMDD/YYYYMMDD (next day for end)
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextYear = nextDay.getFullYear();
  const nextMonth = String(nextDay.getMonth() + 1).padStart(2, '0');
  const nextDayNum = String(nextDay.getDate()).padStart(2, '0');
  const endDateFormatted = `${nextYear}${nextMonth}${nextDayNum}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateFormatted}/${endDateFormatted}&details=${details}`;
};

const PocPlanHeader: FunctionComponent<IPocPlanHeaderProps> = ({
  concept,
  pocPlan,
}) => {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col gap-4'>
      {/* Breadcrumb */}
      <div className='flex items-center gap-2'>
        <button
          onClick={() => navigate(`/concept/${concept.identifier}/`)}
          className='aucctus-text-tertiary aucctus-text-sm hover:aucctus-text-primary flex items-center gap-1 transition-colors'
        >
          <Icon variant='arrowleft' className='h-4 w-4 stroke-current' />
          Back to Concept Report
        </button>
      </div>

      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2'>
            <Icon
              variant='rocket'
              height={28}
              width={28}
              className='aucctus-stroke-brand-primary'
            />
            <Header.One text='Proof of Concept Plan' />
          </div>
          <p className='aucctus-text-md aucctus-text-secondary mt-1'>
            {concept.title}
          </p>
        </div>

        {/* Key Info - Proposal focused */}
        <div className='flex items-center gap-4'>
          {/* Go/No-Go Decision Date - Most Important - Links to Google Calendar */}
          {pocPlan.goNoGoDate ? (
            <a
              href={generateGoogleCalendarUrl(
                pocPlan.goNoGoDate,
                concept.title,
              )}
              target='_blank'
              rel='noopener noreferrer'
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-2',
                'bg-gradient-to-r from-primary-500 to-primary-600',
                'shadow-md',
                'transition-all duration-200 hover:scale-[1.02] hover:shadow-lg',
                'cursor-pointer',
              )}
              title='Add to Google Calendar'
            >
              <Icon variant='calendar' className='h-5 w-5 stroke-white' />
              <div className='flex flex-col'>
                <span className='text-[10px] uppercase tracking-wider text-white/80'>
                  Go/No-Go Decision
                </span>
                <span className='text-sm font-semibold text-white'>
                  {formatGoNoGoDate(pocPlan.goNoGoDate)}
                </span>
              </div>
              <Icon
                variant='link-external'
                className='h-3.5 w-3.5 stroke-white/60'
              />
            </a>
          ) : (
            <div
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-2',
                'bg-gradient-to-r from-primary-500 to-primary-600',
                'shadow-md',
              )}
            >
              <Icon variant='calendar' className='h-5 w-5 stroke-white' />
              <div className='flex flex-col'>
                <span className='text-[10px] uppercase tracking-wider text-white/80'>
                  Go/No-Go Decision
                </span>
                <span className='text-sm font-semibold text-white'>TBD</span>
              </div>
            </div>
          )}

          <div className='aucctus-bg-secondary h-10 w-px' />

          {/* Duration */}
          <div className='flex flex-col'>
            <span className='aucctus-text-tertiary text-[10px] uppercase tracking-wider'>
              Duration
            </span>
            <span className='aucctus-text-primary aucctus-text-sm-semibold'>
              {pocPlan.totalWeeks} weeks
            </span>
          </div>

          <div className='aucctus-bg-secondary h-10 w-px' />

          {/* Generated Date */}
          <div className='flex flex-col'>
            <span className='aucctus-text-tertiary text-[10px] uppercase tracking-wider'>
              Generated
            </span>
            <span className='aucctus-text-secondary aucctus-text-sm'>
              {new Date(pocPlan.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PocPlanHeader;
