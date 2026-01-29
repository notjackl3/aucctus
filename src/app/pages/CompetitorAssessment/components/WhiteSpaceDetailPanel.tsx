import React from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import type { IWhiteSpaceOpportunity } from '@libs/api/types/competitorAssessment';

interface WhiteSpaceDetailPanelProps {
  whiteSpace: IWhiteSpaceOpportunity;
  onClose: () => void;
}

const urgencyConfig: Record<string, { color: string; label: string }> = {
  immediate: {
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    label: 'Immediate',
  },
  strategic: {
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    label: 'Strategic',
  },
  exploratory: {
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    label: 'Exploratory',
  },
};

const WhiteSpaceDetailPanel: React.FC<WhiteSpaceDetailPanelProps> = ({
  whiteSpace,
  onClose,
}) => {
  const urgency = urgencyConfig[whiteSpace.urgency] || {
    color: 'aucctus-bg-secondary aucctus-text-secondary',
    label: whiteSpace.urgency,
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className='fixed inset-0 z-40 bg-black/50'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Side Panel */}
      <motion.div
        className='aucctus-bg-primary aucctus-border-secondary fixed bottom-0 right-0 top-0 z-50 w-[480px] border-l shadow-2xl'
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className='aucctus-border-secondary flex items-center justify-between border-b px-6 py-4'>
          <div className='flex items-center gap-2'>
            <Icon
              variant='sparkles'
              height={16}
              width={16}
              className='stroke-amber-500'
            />
            <span className='aucctus-text-primary font-semibold'>
              White Space Opportunity
            </span>
          </div>
          <button
            onClick={onClose}
            className='aucctus-bg-secondary-hover rounded-lg p-2 transition-colors'
          >
            <Icon
              variant='closeX'
              height={16}
              width={16}
              className='aucctus-stroke-secondary'
            />
          </button>
        </div>

        {/* Content */}
        <div className='h-[calc(100%-65px)] overflow-y-auto p-6'>
          <div className='space-y-5'>
            {/* Badges */}
            <div className='flex items-center gap-2'>
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                  urgency.color,
                )}
              >
                {urgency.label}
              </span>
              <div className='flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-amber-400'>
                <Icon
                  variant='star-01'
                  height={12}
                  width={12}
                  className='stroke-current'
                />
                <span className='text-[10px] font-medium'>
                  Score: {whiteSpace.opportunityScore}
                </span>
              </div>
              <span className='aucctus-bg-secondary aucctus-text-secondary rounded-full px-2 py-0.5 text-[10px]'>
                {whiteSpace.gapType}
              </span>
            </div>

            {/* Title */}
            <h3 className='aucctus-text-primary text-lg font-semibold leading-snug'>
              {whiteSpace.title}
            </h3>

            {/* Description */}
            <p className='aucctus-text-secondary text-sm leading-relaxed'>
              {whiteSpace.description}
            </p>

            {/* Market Opportunity */}
            <div className='aucctus-bg-secondary rounded-lg p-4'>
              <div className='mb-2 flex items-center gap-1.5'>
                <Icon
                  variant='trending-up'
                  height={14}
                  width={14}
                  className='stroke-green-500'
                />
                <span className='aucctus-text-secondary text-[10px] font-semibold uppercase tracking-wider'>
                  Market Opportunity
                </span>
              </div>
              <p className='aucctus-text-primary text-sm leading-relaxed'>
                {whiteSpace.marketOpportunity}
              </p>
            </div>

            {/* Evidence Summary */}
            <div className='space-y-1.5'>
              <div className='flex items-center gap-1.5'>
                <Icon
                  variant='file-text'
                  height={12}
                  width={12}
                  className='aucctus-stroke-tertiary'
                />
                <span className='aucctus-text-secondary text-[10px] font-semibold uppercase tracking-wider'>
                  Evidence Summary
                </span>
              </div>
              <p className='aucctus-text-secondary pl-4 text-sm leading-relaxed'>
                {whiteSpace.evidenceSummary}
              </p>
            </div>

            {/* Recommendation */}
            <div className='rounded-lg border border-amber-500/20 bg-amber-500/10 p-4'>
              <div className='mb-2 flex items-center gap-1.5'>
                <Icon
                  variant='lightbulb'
                  height={14}
                  width={14}
                  className='stroke-amber-500'
                />
                <span className='aucctus-text-secondary text-[10px] font-semibold uppercase tracking-wider'>
                  Recommendation
                </span>
              </div>
              <p className='aucctus-text-primary text-sm leading-relaxed'>
                {whiteSpace.recommendation}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default WhiteSpaceDetailPanel;
