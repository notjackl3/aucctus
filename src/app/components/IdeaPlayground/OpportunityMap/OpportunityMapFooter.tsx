import React from 'react';
import { Icon } from '@components';

interface OpportunityMapFooterProps {
  selectedIdeasCount: number;
  onGenerateReports: () => void;
}

const OpportunityMapFooter: React.FC<OpportunityMapFooterProps> = ({
  selectedIdeasCount,
  onGenerateReports,
}) => {
  return (
    <div className='flex border-t border-white/10 bg-black/20 backdrop-blur-md'>
      {/* Left Side - Feedback Input (Coming Soon) */}
      <div className='flex w-1/2 items-center gap-2 border-r border-white/10 p-6'>
        <div className='flex flex-1 items-center gap-2 opacity-50'>
          <input
            type='text'
            placeholder='Provide feedback to regenerate ideas...'
            maxLength={500}
            className='aucctus-text-white placeholder:aucctus-text-placeholder flex-1 cursor-not-allowed rounded-md border border-white/20 bg-white/10 px-3 py-2 transition-all duration-200 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30'
            disabled={true}
          />
          <button
            disabled={true}
            className='flex h-9 w-9 flex-shrink-0 cursor-not-allowed items-center justify-center rounded-md border border-white/20 bg-white/10 p-2 transition-all duration-200'
          >
            <Icon
              variant='paper-airplane'
              className='aucctus-stroke-white'
              height={16}
              width={16}
            />
          </button>
        </div>
        <div className='flex flex-shrink-0 items-center rounded-md border border-white/20 bg-white/10 px-3 py-1.5'>
          <span className='aucctus-text-xs aucctus-text-secondary'>
            Coming Soon
          </span>
        </div>
      </div>

      {/* Right Side - Selected Count and Generate Reports Button */}
      <div className='flex w-1/2 items-center justify-end gap-3 p-6'>
        <div className='aucctus-text-secondary aucctus-text-sm'>
          {selectedIdeasCount} idea{selectedIdeasCount !== 1 ? 's' : ''}{' '}
          selected
        </div>

        <button
          onClick={onGenerateReports}
          disabled={selectedIdeasCount === 0}
          className={`flex items-center gap-2 whitespace-nowrap rounded-md border px-4 py-2 transition-all duration-300 ${
            selectedIdeasCount === 0
              ? 'aucctus-bg-disabled aucctus-text-disabled aucctus-border-disabled cursor-not-allowed opacity-50'
              : 'aucctus-bg-brand-solid aucctus-text-white hover:aucctus-bg-brand-solid-hover border-transparent'
          }`}
        >
          <Icon
            variant='presentation-chart'
            className={`${
              selectedIdeasCount === 0
                ? 'aucctus-stroke-disabled'
                : 'aucctus-stroke-white'
            }`}
            height={16}
            width={16}
          />
          <span>Generate Reports</span>
        </button>
      </div>
    </div>
  );
};

export default OpportunityMapFooter;
