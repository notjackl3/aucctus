import React from 'react';
import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import type { IWhiteSpaceOpportunity } from '@libs/api/types/competitorAssessment';
import ConfidenceRing from './ConfidenceRing';
import { ChevronRight, FileText, Layers } from 'lucide-react';

interface WhiteSpaceCardEnhancedProps {
  whiteSpace: IWhiteSpaceOpportunity;
  onClick: () => void;
  index: number;
}

const urgencyConfig: Record<
  string,
  { color: string; border: string; bg: string; label: string }
> = {
  immediate: {
    color: 'text-red-400',
    border: 'border-l-red-500',
    bg: 'bg-red-500/10 border-red-500/30',
    label: 'Immediate',
  },
  strategic: {
    color: 'text-amber-400',
    border: 'border-l-amber-500',
    bg: 'bg-amber-500/10 border-amber-500/30',
    label: 'Strategic',
  },
  exploratory: {
    color: 'text-blue-400',
    border: 'border-l-blue-500',
    bg: 'bg-blue-500/10 border-blue-500/30',
    label: 'Exploratory',
  },
};

const WhiteSpaceCardEnhanced: React.FC<WhiteSpaceCardEnhancedProps> = ({
  whiteSpace,
  onClick,
  index,
}) => {
  const urgency =
    urgencyConfig[whiteSpace.urgency] || urgencyConfig.exploratory;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={cn(
        'aucctus-bg-secondary aucctus-border-secondary group cursor-pointer overflow-hidden rounded-xl border border-l-4 transition-shadow hover:shadow-lg hover:shadow-black/10',
        urgency.border,
      )}
    >
      <div className='p-5'>
        {/* Top row: badges + score ring */}
        <div className='mb-3 flex items-start justify-between'>
          <div className='flex flex-wrap items-center gap-2'>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                urgency.bg,
                urgency.color,
              )}
            >
              {urgency.label}
            </span>
            <span className='aucctus-bg-primary aucctus-text-tertiary rounded-full px-2 py-0.5 text-[10px]'>
              {whiteSpace.gapType}
            </span>
          </div>
          <ConfidenceRing
            score={whiteSpace.opportunityScore}
            size={38}
            strokeWidth={3}
          />
        </div>

        {/* Title */}
        <h4 className='aucctus-text-primary aucctus-text-sm-semibold mb-2 line-clamp-2 leading-snug'>
          {whiteSpace.title}
        </h4>

        {/* Description */}
        <p className='aucctus-text-secondary mb-3 line-clamp-2 text-xs leading-relaxed'>
          {whiteSpace.description}
        </p>

        {/* Evidence preview */}
        {whiteSpace.evidenceSummary && (
          <div className='aucctus-bg-primary mb-3 rounded-lg px-3 py-2'>
            <p className='aucctus-text-tertiary line-clamp-1 text-[10px] leading-relaxed'>
              <FileText size={9} className='mr-1 inline stroke-current' />
              {whiteSpace.evidenceSummary}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1'>
            <Layers size={10} className='aucctus-stroke-tertiary' />
            <span className='aucctus-text-tertiary text-[10px]'>
              {whiteSpace.gapType}
            </span>
          </div>
          <ChevronRight
            size={14}
            className='aucctus-stroke-tertiary transition-transform group-hover:translate-x-0.5'
          />
        </div>
      </div>
    </motion.div>
  );
};

export default WhiteSpaceCardEnhanced;
