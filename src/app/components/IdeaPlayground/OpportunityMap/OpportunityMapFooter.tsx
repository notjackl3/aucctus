import React from 'react';
import { Icon } from '@components';

interface OpportunityMapFooterProps {
  feedbackText: string;
  selectedIdeasCount: number;
  onFeedbackChange: (value: string) => void;
  onFeedbackSubmit: (e: React.FormEvent) => void;
  onGenerateReports: () => void;
}

const OpportunityMapFooter: React.FC<OpportunityMapFooterProps> = ({
  feedbackText,
  selectedIdeasCount,
  onFeedbackChange,
  onFeedbackSubmit,
  onGenerateReports,
}) => {
  return (
    <div className='border-t border-white/10 p-4'>
      <div className='flex items-center justify-between'>
        <form
          onSubmit={onFeedbackSubmit}
          className='flex flex-1 justify-center'
        >
          <div className='relative w-full max-w-md'>
            <input
              type='text'
              value={feedbackText}
              onChange={(e) => onFeedbackChange(e.target.value)}
              placeholder='Provide Feedback on Ideas - Coming Soon...'
              // Original enabled styles (preserved for reversion):
              // className='aucctus-text-white placeholder:aucctus-text-placeholder w-full rounded-full border border-white/20 bg-white/10 px-6 py-3 backdrop-blur-md transition-all duration-200 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/40'
              className='w-full cursor-not-allowed rounded-full border border-white/10 bg-white/5 px-6 py-3 text-white/40 opacity-50 backdrop-blur-md placeholder:text-white/30'
              maxLength={500}
              disabled={true}
            />
            <button
              type='submit'
              // Original enabled styles (preserved for reversion):
              // className='absolute right-2 top-1/2 -translate-y-1/2 transform rounded-full bg-white/20 p-2 backdrop-blur-md transition-all duration-200 hover:bg-white/30'
              className='absolute right-2 top-1/2 -translate-y-1/2 transform cursor-not-allowed rounded-full bg-white/10 p-2 opacity-50 backdrop-blur-md'
              disabled={true}
            >
              <Icon
                variant='paper-airplane'
                // Original enabled styles (preserved for reversion):
                // className='aucctus-stroke-white'
                className='stroke-white/40'
                height={16}
                width={16}
              />
            </button>
          </div>
        </form>

        {/* Generate Reports Button */}
        <button
          onClick={onGenerateReports}
          disabled={selectedIdeasCount === 0}
          className={`btn whitespace-nowrap border px-3 py-2 backdrop-blur-md transition-all duration-300 ${
            selectedIdeasCount === 0
              ? 'aucctus-bg-disabled aucctus-text-disabled aucctus-border-disabled cursor-not-allowed opacity-50'
              : 'btn-success animate-pulse'
          }`}
        >
          <Icon
            variant='presentation-chart'
            className={
              selectedIdeasCount === 0
                ? 'aucctus-stroke-disabled mr-2'
                : 'aucctus-stroke-white mr-2'
            }
            height={16}
            width={16}
          />
          Generate Reports
        </button>
      </div>
    </div>
  );
};

export default OpportunityMapFooter;
