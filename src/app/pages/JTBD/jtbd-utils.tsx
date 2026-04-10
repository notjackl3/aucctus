import type {
  IJTBDJob,
  JTBDMarketType,
  OpportunityTier,
} from '@libs/api/types/jtbd';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

// ============================================
// Tier & Segment color records
// ============================================

export const tierColors: Record<OpportunityTier, string> = {
  high: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  low: 'bg-red-400/20 text-red-300 border-red-400/30',
};

export const tierLabels: Record<OpportunityTier, string> = {
  high: 'High Opportunity',
  medium: 'Medium Opportunity',
  low: 'Low Opportunity',
};

export const segmentColors: Record<string, string> = {
  b2c: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
  b2b: 'bg-sky-500/15 text-sky-300 border-sky-500/20',
};

// ============================================
// Helper functions
// ============================================

export function opportunityDollars(score: number): string {
  if (score >= 80) return '$$$$';
  if (score >= 60) return '$$$';
  if (score >= 40) return '$$';
  return '$';
}

export function evidenceLabel(strength: number): string {
  if (strength >= 75) return 'Overwhelming';
  if (strength >= 40) return 'Strong';
  return 'Emerging';
}

export function formatMarketValue(value: number | null): string {
  if (value == null) return '\u2014';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

// ============================================
// ScoreBar component
// ============================================

export const ScoreBar: React.FC<{
  label: string;
  value: number;
  delay?: number;
}> = ({ label, value, delay = 0 }) => (
  <div className='flex items-center gap-3'>
    <span className='w-32 shrink-0 text-right text-[11px] text-white/50'>
      {label}
    </span>
    <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-white/10'>
      <motion.div
        className='h-full rounded-full bg-gradient-to-r from-white/40 to-white/70'
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5, ease: 'easeOut', delay }}
      />
    </div>
    <span className='w-8 text-right text-xs text-white/50'>{value}</span>
  </div>
);

// ============================================
// ParsedTitle component
// ============================================

export const ParsedTitle: React.FC<{ title: string; expanded?: boolean }> = ({
  title,
  expanded = false,
}) => {
  const wantMatch = title.match(/^(.*?)(I want .+?)(, so that .+)$/);
  if (wantMatch) {
    return (
      <>
        {wantMatch[1]}
        <span
          className={
            expanded ? 'font-semibold text-white' : 'font-semibold text-white'
          }
        >
          {wantMatch[2]}
        </span>
        <span className='text-white/45'>{wantMatch[3]}</span>
      </>
    );
  }
  return <>{title}</>;
};

// ============================================
// MarketSizeVisualization component
// ============================================

export const MarketSizeVisualization: React.FC<{
  marketType: JTBDMarketType;
  tamValue: number | null;
  samValue: number | null;
  somValue: number | null;
  height?: string;
}> = ({ marketType, tamValue, samValue, somValue, height = '120px' }) => {
  if (tamValue == null && samValue == null && somValue == null) {
    return null;
  }

  if (marketType === 'new') {
    const bars = [
      {
        label: 'TAM',
        value: formatMarketValue(tamValue),
        width: '100%',
        color: 'bg-amber-500/25 border-amber-500/30 text-amber-300',
      },
      {
        label: 'SAM',
        value: formatMarketValue(samValue),
        width: '65%',
        color: 'bg-amber-500/20 border-amber-500/25 text-amber-300/80',
      },
      {
        label: 'SOM',
        value: formatMarketValue(somValue),
        width: '35%',
        color: 'bg-amber-500/15 border-amber-500/20 text-amber-300/60',
      },
    ];

    return (
      <div className='flex flex-col gap-2'>
        {bars.map((bar) => (
          <div key={bar.label} className='flex flex-col gap-0.5'>
            <span className='text-[9px] uppercase tracking-wider text-white/30'>
              {bar.label}
            </span>
            <div
              className={cn(
                'rounded-md border px-2 py-1.5 text-[11px] font-semibold',
                bar.color,
              )}
              style={{ width: bar.width }}
            >
              {bar.value}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Nested rectangles for existing markets
  return (
    <div className='relative w-full' style={{ height }}>
      <div className='absolute inset-0 rounded-lg border border-blue-500/20 bg-blue-500/10'>
        <div className='absolute left-2 right-2 top-1.5 flex items-start justify-between'>
          <span className='text-[9px] font-semibold uppercase tracking-wider text-blue-300/70'>
            TAM
          </span>
          <div className='text-sm font-bold text-blue-300'>
            {formatMarketValue(tamValue)}
          </div>
        </div>
      </div>
      <div className='absolute bottom-0 left-0 h-[75%] w-[55%] rounded-lg border border-indigo-500/25 bg-indigo-500/15'>
        <div className='absolute left-2 right-2 top-1.5 flex items-start justify-between'>
          <span className='text-[9px] font-semibold uppercase tracking-wider text-indigo-300/70'>
            SAM
          </span>
          <div className='text-xs font-bold text-indigo-300'>
            {formatMarketValue(samValue)}
          </div>
        </div>
      </div>
      <div
        className='absolute bottom-0 left-0 h-[45%] w-[30%] rounded-lg border border-purple-500/30'
        style={{
          background:
            'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.1))',
        }}
      >
        <div className='absolute left-1.5 top-1'>
          <span className='text-[8px] font-semibold uppercase tracking-wider text-purple-300/70'>
            SOM
          </span>
          <div className='text-[11px] font-bold text-purple-300'>
            {formatMarketValue(somValue)}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// CollapsibleSection component
// ============================================

export const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className='group/section flex w-full items-center gap-2 py-2'
      >
        {icon}
        <span className='text-[11px] font-semibold uppercase tracking-wider text-white/50'>
          {title}
        </span>
        <div className='ml-2 h-px flex-1 bg-white/[0.08]' />
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-white/30 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// Re-export types for convenience
// ============================================

export type { IJTBDJob, JTBDMarketType, OpportunityTier };
