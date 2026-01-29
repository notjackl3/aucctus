import React, { useState, useMemo } from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { AnimatePresence } from 'framer-motion';
import type {
  IWhiteSpaceOpportunity,
  WhiteSpaceUrgency,
} from '@libs/api/types/competitorAssessment';
import WhiteSpaceCardEnhanced from './WhiteSpaceCardEnhanced';
import WhiteSpaceDetailPanel from './WhiteSpaceDetailPanel';

interface WhiteSpaceGridProps {
  whiteSpaces: IWhiteSpaceOpportunity[];
}

type SortMode = 'score' | 'urgency';
type FilterMode = 'all' | WhiteSpaceUrgency;

const urgencyOrder: Record<string, number> = {
  immediate: 0,
  strategic: 1,
  exploratory: 2,
};

const filterOptions: { value: FilterMode; label: string; color?: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'immediate', label: 'Immediate', color: 'bg-red-400' },
  { value: 'strategic', label: 'Strategic', color: 'bg-amber-400' },
  { value: 'exploratory', label: 'Exploratory', color: 'bg-blue-400' },
];

const WhiteSpaceGrid: React.FC<WhiteSpaceGridProps> = ({ whiteSpaces }) => {
  const [selectedWhiteSpace, setSelectedWhiteSpace] =
    useState<IWhiteSpaceOpportunity | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('score');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const filtered = useMemo(() => {
    let result = [...whiteSpaces];
    if (filterMode !== 'all') {
      result = result.filter((ws) => ws.urgency === filterMode);
    }
    if (sortMode === 'score') {
      result.sort((a, b) => b.opportunityScore - a.opportunityScore);
    } else {
      result.sort(
        (a, b) =>
          (urgencyOrder[a.urgency] ?? 99) - (urgencyOrder[b.urgency] ?? 99),
      );
    }
    return result;
  }, [whiteSpaces, sortMode, filterMode]);

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: whiteSpaces.length };
    whiteSpaces.forEach((ws) => {
      counts[ws.urgency] = (counts[ws.urgency] || 0) + 1;
    });
    return counts;
  }, [whiteSpaces]);

  if (whiteSpaces.length === 0) {
    return (
      <div className='aucctus-bg-secondary aucctus-border-secondary flex flex-col items-center justify-center rounded-xl border p-12'>
        <Icon
          variant='sparkles'
          height={48}
          width={48}
          className='mb-4 stroke-amber-500/30'
        />
        <p className='aucctus-text-secondary text-sm'>
          No white space opportunities discovered yet.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Controls */}
      <div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
        {/* Filter pills */}
        <div className='flex items-center gap-2'>
          {filterOptions.map((opt) => {
            const count = filterCounts[opt.value] || 0;
            const isActive = filterMode === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setFilterMode(opt.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'aucctus-border-brand aucctus-text-primary bg-white/10'
                    : 'aucctus-border-secondary aucctus-text-tertiary aucctus-bg-secondary-hover',
                )}
              >
                {opt.color && (
                  <div className={cn('h-1.5 w-1.5 rounded-full', opt.color)} />
                )}
                {opt.label}
                <span
                  className={cn(
                    'text-[10px]',
                    isActive
                      ? 'aucctus-text-secondary'
                      : 'aucctus-text-tertiary',
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort toggle */}
        <div className='aucctus-bg-secondary aucctus-border-secondary flex items-center rounded-lg border'>
          <button
            onClick={() => setSortMode('score')}
            className={cn(
              'flex items-center gap-1.5 rounded-l-lg px-3 py-1.5 text-xs font-medium transition-colors',
              sortMode === 'score'
                ? 'aucctus-text-primary bg-white/10'
                : 'aucctus-text-tertiary',
            )}
          >
            <Icon
              variant='star-01'
              height={11}
              width={11}
              className='stroke-current'
            />
            Score
          </button>
          <button
            onClick={() => setSortMode('urgency')}
            className={cn(
              'flex items-center gap-1.5 rounded-r-lg px-3 py-1.5 text-xs font-medium transition-colors',
              sortMode === 'urgency'
                ? 'aucctus-text-primary bg-white/10'
                : 'aucctus-text-tertiary',
            )}
          >
            <Icon
              variant='alert-triangle'
              height={11}
              width={11}
              className='stroke-current'
            />
            Urgency
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {filtered.map((ws, index) => (
          <WhiteSpaceCardEnhanced
            key={ws.uuid}
            whiteSpace={ws}
            onClick={() => setSelectedWhiteSpace(ws)}
            index={index}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className='aucctus-bg-secondary aucctus-border-secondary flex items-center justify-center rounded-xl border p-8'>
          <p className='aucctus-text-tertiary text-sm'>
            No opportunities match this filter.
          </p>
        </div>
      )}

      {/* Detail panel */}
      <AnimatePresence>
        {selectedWhiteSpace && (
          <WhiteSpaceDetailPanel
            whiteSpace={selectedWhiteSpace}
            onClose={() => setSelectedWhiteSpace(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default WhiteSpaceGrid;
