import { FunctionComponent } from 'react';
import { IPocExecutiveSummary } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { CheckCircle2, FileText } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface IExecutiveSummaryProps {
  summary: IPocExecutiveSummary;
}

interface ISummaryCardProps {
  icon: string;
  title: string;
  content: string;
  variant?: 'default' | 'highlight';
}

const SummaryCard: FunctionComponent<ISummaryCardProps> = ({
  icon,
  title,
  content,
  variant = 'default',
}) => (
  <div
    className={cn(
      'flex flex-col gap-3 rounded-lg p-5',
      variant === 'default' && 'aucctus-bg-secondary',
      variant === 'highlight' && 'aucctus-bg-brand-secondary',
    )}
  >
    <div className='flex items-center gap-2'>
      <DynamicIcon
        variant={icon}
        className={cn(
          'h-5 w-5',
          variant === 'default' && 'aucctus-stroke-tertiary',
          variant === 'highlight' && 'aucctus-stroke-brand-primary',
        )}
      />
      <span
        className={cn(
          'aucctus-text-sm-semibold',
          variant === 'default' && 'aucctus-text-secondary',
          variant === 'highlight' && 'aucctus-text-brand-primary',
        )}
      >
        {title}
      </span>
    </div>
    <p
      className={cn(
        'aucctus-text-sm leading-relaxed',
        variant === 'default' && 'aucctus-text-primary',
        variant === 'highlight' && 'aucctus-text-primary',
      )}
    >
      {content}
    </p>
  </div>
);

const ExecutiveSummary: FunctionComponent<IExecutiveSummaryProps> = ({
  summary,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 rounded-xl p-8',
        'aucctus-bg-primary',
        'aucctus-border-primary border',
        'shadow-sm',
      )}
    >
      {/* Section Header */}
      <div className='flex items-center gap-3'>
        <div className='aucctus-bg-brand-secondary flex h-10 w-10 items-center justify-center rounded-lg'>
          <FileText className='aucctus-stroke-brand-primary h-5 w-5' />
        </div>
        <h2 className='aucctus-text-primary aucctus-header-md-semibold'>
          Executive Summary
        </h2>
      </div>

      {/* Overview - Full width */}
      <div className='aucctus-bg-secondary rounded-lg p-6'>
        <p className='aucctus-text-primary aucctus-text-lg leading-relaxed'>
          {summary.overview}
        </p>
      </div>

      {/* Grid of summary cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <SummaryCard
          icon='lightbulb'
          title='Strategic Rationale'
          content={summary.strategicRationale}
        />
        <SummaryCard
          icon='target'
          title='Expected Outcome'
          content={summary.expectedOutcome}
        />
        <SummaryCard
          icon='currency-dollar'
          title='Investment Required'
          content={summary.investmentRequired}
          variant='highlight'
        />
      </div>

      {/* Decision Criteria - Highlighted */}
      <div
        className={cn(
          'flex items-start gap-4 rounded-lg p-6',
          'bg-gradient-to-r from-primary-50 to-primary-100',
          'dark:from-primary-950 dark:to-primary-900',
          'border border-primary-200 dark:border-primary-800',
        )}
      >
        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-500'>
          <CheckCircle2 className='h-5 w-5 stroke-white' />
        </div>
        <div className='flex flex-col gap-2'>
          <span className='aucctus-text-brand-primary aucctus-text-sm-semibold'>
            Go/No-Go Decision Criteria
          </span>
          <p className='aucctus-text-primary aucctus-text-md'>
            {summary.decisionCriteria}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummary;
