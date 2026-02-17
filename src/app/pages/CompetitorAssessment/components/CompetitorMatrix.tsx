import React, { useState, useCallback } from 'react';
import { cn } from '@libs/utils/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ICompetitor } from '@libs/api/types/competitorAssessment';
import {
  Building,
  ChevronUp,
  Columns3,
  Expand,
  ShieldCheck,
  Swords,
} from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

const assessmentRows = [
  {
    key: 'applicationUseCase',
    label: 'Application / Use Case',
    icon: 'target',
  },
  { key: 'leadProduct', label: 'Lead Product', icon: 'cube' },
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

type AssessmentRowKey = (typeof assessmentRows)[number]['key'];

const confidenceColors: Record<
  string,
  { border: string; bg: string; text: string }
> = {
  high: {
    border: 'border-t-green-500',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
  },
  medium: {
    border: 'border-t-amber-500',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
  },
  low: {
    border: 'border-t-red-500',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
  },
};

interface CompetitorMatrixProps {
  competitors: ICompetitor[];
}

const CompetitorMatrix: React.FC<CompetitorMatrixProps> = ({ competitors }) => {
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [expandedCell, setExpandedCell] = useState<string | null>(null);

  const yourCompany = competitors.find((c) => c.isYourCompany);
  const otherCompetitors = competitors.filter((c) => !c.isYourCompany);
  const orderedCompetitors = yourCompany
    ? [yourCompany, ...otherCompetitors]
    : otherCompetitors;

  const toggleCell = useCallback((cellKey: string) => {
    setExpandedCell((prev) => (prev === cellKey ? null : cellKey));
  }, []);

  if (orderedCompetitors.length === 0) {
    return (
      <div className='aucctus-bg-secondary aucctus-border-secondary flex flex-col items-center justify-center rounded-lg border p-12'>
        <Swords size={48} className='aucctus-stroke-tertiary mb-4' />
        <p className='aucctus-text-secondary text-sm'>
          No competitors to display. Run a scan to discover competitors.
        </p>
      </div>
    );
  }

  return (
    <div className='aucctus-border-secondary overflow-hidden rounded-xl border'>
      <div className='overflow-x-auto'>
        <table className='min-w-full'>
          <thead>
            <tr className='aucctus-bg-secondary'>
              <th className='aucctus-border-secondary aucctus-text-secondary sticky left-0 z-10 border-b border-r bg-inherit px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider'>
                <div className='flex items-center gap-2'>
                  <Columns3 size={14} className='aucctus-stroke-tertiary' />
                  Attribute
                </div>
              </th>
              {orderedCompetitors.map((competitor) => {
                const conf = competitor.assessment?.confidence || 'low';
                const colors = confidenceColors[conf] || confidenceColors.low;

                return (
                  <th
                    key={competitor.uuid}
                    className={cn(
                      'aucctus-border-secondary relative min-w-[200px] border-b border-t-4 px-4 py-4 text-center transition-colors duration-200',
                      colors.border,
                      competitor.isYourCompany && 'bg-amber-500/5',
                      hoveredColumn === competitor.uuid &&
                        !competitor.isYourCompany &&
                        'bg-white/[0.03]',
                    )}
                    onMouseEnter={() => setHoveredColumn(competitor.uuid)}
                    onMouseLeave={() => setHoveredColumn(null)}
                  >
                    {competitor.isYourCompany && (
                      <div className='absolute inset-y-0 left-0 w-1 bg-amber-500' />
                    )}
                    <div className='flex flex-col items-center gap-1.5'>
                      {competitor.logoUrl ? (
                        <img
                          src={competitor.logoUrl}
                          alt={competitor.name}
                          className='h-9 w-9 rounded-lg object-contain'
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              'none';
                          }}
                        />
                      ) : (
                        <div className='aucctus-bg-primary flex h-9 w-9 items-center justify-center rounded-lg'>
                          <Building
                            size={16}
                            className='aucctus-stroke-tertiary'
                          />
                        </div>
                      )}
                      <span
                        className={cn(
                          'aucctus-text-primary text-sm font-semibold',
                          competitor.isYourCompany && 'text-amber-500',
                        )}
                      >
                        {competitor.name}
                      </span>
                      {competitor.isYourCompany && (
                        <span className='rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400'>
                          Your Company
                        </span>
                      )}
                      {competitor.assessment && (
                        <div
                          className={cn(
                            'flex items-center gap-1 text-[10px] font-medium',
                            colors.text,
                          )}
                        >
                          <ShieldCheck size={10} className='stroke-current' />
                          {competitor.assessment.confidenceScore}% confidence
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {assessmentRows.map((row, rowIndex) => (
              <tr
                key={row.key}
                className={cn(
                  'transition-colors',
                  rowIndex % 2 === 0
                    ? 'aucctus-bg-primary'
                    : 'aucctus-bg-secondary',
                )}
              >
                <td className='aucctus-border-secondary aucctus-text-primary sticky left-0 z-10 border-r bg-inherit px-5 py-3.5'>
                  <div className='flex items-center gap-2.5'>
                    <div className='aucctus-bg-secondary flex h-7 w-7 shrink-0 items-center justify-center rounded-md'>
                      <DynamicIcon
                        variant={row.icon as any}
                        height={13}
                        width={13}
                        className='aucctus-stroke-secondary'
                      />
                    </div>
                    <span className='text-sm font-medium'>{row.label}</span>
                  </div>
                </td>
                {orderedCompetitors.map((competitor) => {
                  const value = competitor.assessment?.[
                    row.key as AssessmentRowKey
                  ] as string | undefined;
                  const cellKey = `${competitor.uuid}-${row.key}`;
                  const isExpanded = expandedCell === cellKey;

                  return (
                    <td
                      key={competitor.uuid}
                      className={cn(
                        'aucctus-border-secondary border-r px-4 py-3.5 transition-colors duration-200 last:border-r-0',
                        competitor.isYourCompany && 'bg-amber-500/[0.03]',
                        hoveredColumn === competitor.uuid &&
                          !competitor.isYourCompany &&
                          'bg-white/[0.02]',
                      )}
                      onMouseEnter={() => setHoveredColumn(competitor.uuid)}
                      onMouseLeave={() => setHoveredColumn(null)}
                    >
                      {value ? (
                        <div
                          className='cursor-pointer'
                          onClick={() => toggleCell(cellKey)}
                        >
                          <AnimatePresence mode='wait'>
                            {isExpanded ? (
                              <motion.div
                                key='expanded'
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                              >
                                <p className='aucctus-text-secondary text-xs leading-relaxed'>
                                  {value}
                                </p>
                                <span className='aucctus-text-tertiary mt-1.5 inline-flex items-center gap-1 text-[10px]'>
                                  <ChevronUp
                                    size={8}
                                    className='stroke-current'
                                  />
                                  Collapse
                                </span>
                              </motion.div>
                            ) : (
                              <motion.div
                                key='collapsed'
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                              >
                                <p className='aucctus-text-secondary line-clamp-3 text-xs leading-relaxed'>
                                  {value}
                                </p>
                                {value.length > 150 && (
                                  <span className='aucctus-text-tertiary mt-1 inline-flex items-center gap-1 text-[10px]'>
                                    <Expand
                                      size={8}
                                      className='stroke-current'
                                    />
                                    Expand
                                  </span>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <span className='aucctus-text-tertiary text-xs italic'>
                          No data
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompetitorMatrix;
