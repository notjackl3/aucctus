import React from 'react';
import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import type { ICompetitor } from '@libs/api/types/competitorAssessment';
import ConfidenceRing from './ConfidenceRing';
import { Building, ExternalLink, Search, X } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface CompetitorDetailPanelProps {
  competitor: ICompetitor;
  onClose: () => void;
}

const assessmentSections = [
  {
    key: 'applicationUseCase',
    label: 'Application / Use Case',
    icon: 'target',
  },
  { key: 'leadProduct', label: 'Lead Product', icon: 'cube' },
  {
    key: 'productDescription',
    label: 'Product Description',
    icon: 'file-text',
  },
  {
    key: 'materialsOfConstruction',
    label: 'Materials of Construction',
    icon: 'beaker',
  },
  { key: 'valueProposition', label: 'Value Proposition', icon: 'star-01' },
  { key: 'weaknessesGaps', label: 'Weaknesses / Gaps', icon: 'alert-triangle' },
  { key: 'howTheyWin', label: 'How They Win', icon: 'thumbs-up' },
  { key: 'pricingInfo', label: 'Pricing', icon: 'currency-dollar' },
] as const;

const confidenceColors: Record<string, string> = {
  high: 'text-green-400',
  medium: 'text-amber-400',
  low: 'text-red-400',
};

const CompetitorDetailPanel: React.FC<CompetitorDetailPanelProps> = ({
  competitor,
  onClose,
}) => {
  const assessment = competitor.assessment;

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
        className='aucctus-bg-primary aucctus-border-secondary fixed bottom-0 right-0 top-0 z-50 w-[520px] border-l shadow-2xl'
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className='aucctus-border-secondary border-b px-6 py-5'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-3'>
              {competitor.logoUrl ? (
                <img
                  src={competitor.logoUrl}
                  alt={competitor.name}
                  className='h-10 w-10 rounded-lg object-contain'
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className='aucctus-bg-secondary flex h-10 w-10 items-center justify-center rounded-lg'>
                  <Building size={20} className='aucctus-stroke-tertiary' />
                </div>
              )}
              <div>
                <div className='flex items-center gap-2'>
                  <h2
                    className={cn(
                      'aucctus-text-primary text-lg font-semibold',
                      competitor.isYourCompany && 'text-amber-500',
                    )}
                  >
                    {competitor.name}
                  </h2>
                  {competitor.isYourCompany && (
                    <span className='rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400'>
                      Your Company
                    </span>
                  )}
                </div>
                {competitor.website && (
                  <a
                    href={
                      competitor.website.startsWith('http')
                        ? competitor.website
                        : `https://${competitor.website}`
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                    className='aucctus-text-tertiary mt-0.5 flex items-center gap-1 text-xs hover:underline'
                  >
                    <ExternalLink size={10} className='stroke-current' />
                    {competitor.website
                      .replace(/^https?:\/\//, '')
                      .replace(/\/$/, '')}
                  </a>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className='aucctus-bg-secondary-hover rounded-lg p-2 transition-colors'
            >
              <X size={16} className='aucctus-stroke-secondary' />
            </button>
          </div>

          {/* Meta badges */}
          <div className='mt-3 flex items-center gap-2'>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
                competitor.source === 'ai_suggested'
                  ? 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                  : 'border-blue-500/30 bg-blue-500/10 text-blue-400',
              )}
            >
              <DynamicIcon
                variant={
                  competitor.source === 'ai_suggested' ? 'sparkles' : 'user'
                }
                height={10}
                width={10}
                className='stroke-current'
              />
              {competitor.source === 'ai_suggested'
                ? 'AI Discovered'
                : 'User Added'}
            </span>
            {assessment && (
              <span
                className={cn(
                  'text-[10px] font-medium',
                  confidenceColors[assessment.confidence],
                )}
              >
                {assessment.confidenceScore}% confidence
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className='h-[calc(100%-130px)] overflow-y-auto p-6'>
          <div className='space-y-5'>
            {/* Description */}
            {competitor.description && (
              <div>
                <p className='aucctus-text-secondary text-sm leading-relaxed'>
                  {competitor.description}
                </p>
              </div>
            )}

            {/* Confidence visual */}
            {assessment && (
              <div className='aucctus-bg-secondary flex items-center gap-4 rounded-xl p-4'>
                <ConfidenceRing
                  score={assessment.confidenceScore}
                  size={56}
                  strokeWidth={5}
                />
                <div>
                  <p className='aucctus-text-primary text-sm font-semibold'>
                    Research Confidence
                  </p>
                  <p className='aucctus-text-tertiary text-xs'>
                    Based on {assessment.sources?.length || 0} verified sources
                  </p>
                </div>
              </div>
            )}

            {/* Assessment sections */}
            {assessment && (
              <div className='space-y-4'>
                <h3 className='aucctus-text-secondary text-[10px] font-semibold uppercase tracking-wider'>
                  Assessment Details
                </h3>
                {assessmentSections.map((section) => {
                  const value = assessment[
                    section.key as keyof typeof assessment
                  ] as string | undefined;
                  if (!value || typeof value !== 'string') return null;
                  return (
                    <div key={section.key} className='space-y-1.5'>
                      <div className='flex items-center gap-2'>
                        <DynamicIcon
                          variant={section.icon as any}
                          height={13}
                          width={13}
                          className='aucctus-stroke-tertiary'
                        />
                        <span className='aucctus-text-secondary text-[10px] font-semibold uppercase tracking-wider'>
                          {section.label}
                        </span>
                      </div>
                      <p className='aucctus-text-primary pl-5 text-sm leading-relaxed'>
                        {value}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sources */}
            {assessment &&
              assessment.sources &&
              assessment.sources.length > 0 && (
                <div className='space-y-3'>
                  <h3 className='aucctus-text-secondary text-[10px] font-semibold uppercase tracking-wider'>
                    Sources ({assessment.sources.length})
                  </h3>
                  <div className='space-y-2'>
                    {assessment.sources.map((source) => (
                      <a
                        key={source.uuid}
                        href={source.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='aucctus-bg-secondary aucctus-bg-secondary-hover group flex items-start gap-2.5 rounded-lg p-3 transition-colors'
                      >
                        <ExternalLink
                          size={12}
                          className='aucctus-stroke-tertiary mt-0.5 shrink-0'
                        />
                        <div className='min-w-0'>
                          <p className='aucctus-text-primary truncate text-xs font-medium group-hover:underline'>
                            {source.title}
                          </p>
                          {source.citation && (
                            <p className='aucctus-text-tertiary mt-0.5 line-clamp-2 text-[10px]'>
                              {source.citation}
                            </p>
                          )}
                          <div className='mt-1 flex flex-wrap gap-1'>
                            {source.supportedFields.slice(0, 3).map((field) => (
                              <span
                                key={field}
                                className='aucctus-bg-primary rounded px-1.5 py-0.5 text-[9px] text-white/40'
                              >
                                {field}
                              </span>
                            ))}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            {/* No assessment state */}
            {!assessment && (
              <div className='flex flex-col items-center py-12 text-center'>
                <Search size={32} className='aucctus-stroke-tertiary mb-3' />
                <p className='aucctus-text-secondary text-sm'>
                  No assessment data yet
                </p>
                <p className='aucctus-text-tertiary mt-1 text-xs'>
                  Run a scan to research this competitor
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default CompetitorDetailPanel;
