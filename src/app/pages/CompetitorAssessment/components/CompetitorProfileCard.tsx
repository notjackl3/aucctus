import React from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import type { ICompetitor } from '@libs/api/types/competitorAssessment';
import ConfidenceRing from './ConfidenceRing';

interface CompetitorProfileCardProps {
  competitor: ICompetitor;
  onClick: () => void;
  index: number;
}

const assessmentFields = [
  'applicationUseCase',
  'leadProduct',
  'productDescription',
  'materialsOfConstruction',
  'valueProposition',
  'weaknessesGaps',
  'howTheyWin',
  'pricingInfo',
] as const;

const CompetitorProfileCard: React.FC<CompetitorProfileCardProps> = ({
  competitor,
  onClick,
  index,
}) => {
  const assessment = competitor.assessment;

  const assessedCount = assessment
    ? assessmentFields.filter(
        (f) =>
          assessment[f as keyof typeof assessment] &&
          typeof assessment[f as keyof typeof assessment] === 'string' &&
          (assessment[f as keyof typeof assessment] as string).length > 0,
      ).length
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={cn(
        'aucctus-bg-secondary aucctus-border-secondary group relative cursor-pointer overflow-hidden rounded-xl border transition-shadow hover:shadow-lg hover:shadow-black/10',
        competitor.isYourCompany && 'border-amber-500/30',
      )}
    >
      {/* Your Company accent */}
      {competitor.isYourCompany && (
        <div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500' />
      )}

      <div className='p-5'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            {competitor.logoUrl ? (
              <img
                src={competitor.logoUrl}
                alt={competitor.name}
                className='h-11 w-11 rounded-xl object-contain'
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className='aucctus-bg-primary flex h-11 w-11 items-center justify-center rounded-xl'>
                <Icon
                  variant='building'
                  height={20}
                  width={20}
                  className='aucctus-stroke-tertiary'
                />
              </div>
            )}
            <div>
              <h3
                className={cn(
                  'aucctus-text-primary text-sm font-semibold',
                  competitor.isYourCompany && 'text-amber-500',
                )}
              >
                {competitor.name}
              </h3>
              {competitor.isYourCompany && (
                <span className='text-[10px] text-amber-400/70'>
                  Your Company
                </span>
              )}
              {!competitor.isYourCompany && competitor.website && (
                <span className='aucctus-text-tertiary block truncate text-[10px]'>
                  {competitor.website
                    .replace(/^https?:\/\//, '')
                    .replace(/\/$/, '')}
                </span>
              )}
            </div>
          </div>

          {assessment && (
            <ConfidenceRing
              score={assessment.confidenceScore}
              size={40}
              strokeWidth={3.5}
            />
          )}
        </div>

        {/* Description */}
        {competitor.description && (
          <p className='aucctus-text-secondary mt-3 line-clamp-2 text-xs leading-relaxed'>
            {competitor.description}
          </p>
        )}

        {/* Footer */}
        <div className='mt-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            {/* Source badge */}
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                competitor.source === 'ai_suggested'
                  ? 'bg-purple-500/10 text-purple-400'
                  : 'bg-blue-500/10 text-blue-400',
              )}
            >
              <Icon
                variant={
                  competitor.source === 'ai_suggested' ? 'sparkles' : 'user'
                }
                height={9}
                width={9}
                className='stroke-current'
              />
              {competitor.source === 'ai_suggested' ? 'AI' : 'Manual'}
            </span>

            {/* Assessment coverage */}
            {assessment && (
              <span className='aucctus-text-tertiary text-[10px]'>
                {assessedCount}/{assessmentFields.length} fields
              </span>
            )}
          </div>

          <Icon
            variant='chevron-right'
            height={14}
            width={14}
            className='aucctus-stroke-tertiary transition-transform group-hover:translate-x-0.5'
          />
        </div>
      </div>
    </motion.div>
  );
};

export default CompetitorProfileCard;
