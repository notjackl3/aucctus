import type { JTBDSegment } from '@libs/api/types/jtbd';
import { cn } from '@libs/utils/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion } from 'framer-motion';
import { Check, ChevronDown, ShieldCheck, Trophy } from 'lucide-react';
import React from 'react';

// ============================================
// Filter types
// ============================================

export type OpportunitySizeFilter =
  | 'ALL'
  | 'MASSIVE'
  | 'LARGE'
  | 'MODERATE'
  | 'NICHE';
export type EvidenceStrengthFilter = 'ALL' | 'STRONG' | 'MODERATE' | 'WEAK';
export type AudienceFilter = 'ALL' | 'b2c' | 'b2b';

export interface JTBDFilters {
  opportunitySize: OpportunitySizeFilter;
  evidenceStrength: EvidenceStrengthFilter;
  audience: AudienceFilter;
}

// ============================================
// Filter logic (exported for use in JTBDCanvas)
// ============================================

export function matchesOpportunitySize(
  score: number,
  filter: OpportunitySizeFilter,
): boolean {
  switch (filter) {
    case 'ALL':
      return true;
    case 'MASSIVE':
      return score >= 80;
    case 'LARGE':
      return score >= 60 && score < 80;
    case 'MODERATE':
      return score >= 40 && score < 60;
    case 'NICHE':
      return score < 40;
  }
}

export function matchesEvidenceStrength(
  strength: number,
  filter: EvidenceStrengthFilter,
): boolean {
  switch (filter) {
    case 'ALL':
      return true;
    case 'STRONG':
      return strength >= 70;
    case 'MODERATE':
      return strength >= 40 && strength < 70;
    case 'WEAK':
      return strength < 40;
  }
}

export function matchesAudience(
  segment: JTBDSegment,
  filter: AudienceFilter,
): boolean {
  if (filter === 'ALL') return true;
  return segment === filter;
}

// ============================================
// Dropdown option configs
// ============================================

const OPPORTUNITY_OPTIONS: {
  value: OpportunitySizeFilter;
  label: string;
  description: string;
}[] = [
  { value: 'ALL', label: 'All Sizes', description: 'No filter' },
  { value: 'MASSIVE', label: 'Massive', description: 'Score 80+' },
  { value: 'LARGE', label: 'Large', description: 'Score 60-79' },
  { value: 'MODERATE', label: 'Moderate', description: 'Score 40-59' },
  { value: 'NICHE', label: 'Niche', description: 'Score < 40' },
];

const EVIDENCE_OPTIONS: {
  value: EvidenceStrengthFilter;
  label: string;
  description: string;
}[] = [
  { value: 'ALL', label: 'All Strengths', description: 'No filter' },
  { value: 'STRONG', label: 'Strong', description: 'Strength 70+' },
  { value: 'MODERATE', label: 'Moderate', description: 'Strength 40-69' },
  { value: 'WEAK', label: 'Weak', description: 'Strength < 40' },
];

const AUDIENCE_OPTIONS: { value: AudienceFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'b2c', label: 'Consumers' },
  { value: 'b2b', label: 'Businesses' },
];

// ============================================
// Filter Dropdown (reusable)
// ============================================

interface FilterDropdownProps<T extends string> {
  icon: React.ReactNode;
  label: string;
  value: T;
  options: { value: T; label: string; description?: string }[];
  onChange: (value: T) => void;
}

function FilterDropdown<T extends string>({
  icon,
  label,
  value,
  options,
  onChange,
}: FilterDropdownProps<T>): React.ReactElement {
  const activeOption = options.find((o) => o.value === value);
  const isFiltered = value !== 'ALL';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'inline-flex select-none items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-all duration-200',
            isFiltered
              ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20'
              : 'border-white/[0.15] bg-white/[0.05] text-white/70 hover:bg-white/[0.1] hover:text-white',
          )}
        >
          {icon}
          <span className='font-semibold'>
            {isFiltered ? activeOption?.label : label}
          </span>
          <ChevronDown size={12} className='text-current opacity-50' />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align='start'
          sideOffset={8}
          className='z-50 min-w-[180px] rounded-xl border border-white/[0.15] bg-black/95 p-1.5 shadow-2xl backdrop-blur-xl'
        >
          {options.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              onSelect={() => onChange(option.value)}
              className='group flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-white/80 outline-none hover:bg-white/[0.08] hover:text-white focus:bg-white/[0.08] focus:text-white'
            >
              <div className='flex flex-col'>
                <span
                  className={cn(
                    'text-xs',
                    value === option.value && 'font-semibold text-white',
                  )}
                >
                  {option.label}
                </span>
                {option.description && (
                  <span className='text-[10px] text-white/40'>
                    {option.description}
                  </span>
                )}
              </div>
              {value === option.value && (
                <Check size={12} className='shrink-0 text-emerald-400' />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

// ============================================
// Audience Toggle Group
// ============================================

const AudienceToggle: React.FC<{
  value: AudienceFilter;
  onChange: (value: AudienceFilter) => void;
  instanceId?: string;
}> = ({ value, onChange, instanceId = 'default' }) => (
  <div className='inline-flex rounded-full border border-white/[0.15] bg-white/[0.05] p-0.5 backdrop-blur-md'>
    {AUDIENCE_OPTIONS.map((option) => (
      <button
        key={option.value}
        onClick={() => onChange(option.value)}
        className={cn(
          'relative rounded-full px-3 py-1 text-xs font-medium transition-all duration-200',
          value === option.value
            ? 'text-white'
            : 'text-white/50 hover:text-white/70',
        )}
      >
        {value === option.value && (
          <motion.div
            layoutId={`audience-pill-${instanceId}`}
            className='absolute inset-0 rounded-full border border-white/[0.1] bg-white/[0.15]'
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          />
        )}
        <span className='relative z-10'>{option.label}</span>
      </button>
    ))}
  </div>
);

// ============================================
// Main Filter Bar
// ============================================

interface JTBDFilterBarProps {
  filters: JTBDFilters;
  onFiltersChange: (filters: JTBDFilters) => void;
  totalCount: number;
  filteredCount: number;
  instanceId?: string;
}

export const JTBDFilterBar: React.FC<JTBDFilterBarProps> = ({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
  instanceId = 'default',
}) => {
  const hasActiveFilters =
    filters.opportunitySize !== 'ALL' ||
    filters.evidenceStrength !== 'ALL' ||
    filters.audience !== 'ALL';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='flex flex-wrap items-center gap-3'
    >
      {/* Opportunity Size dropdown */}
      <FilterDropdown
        icon={<Trophy size={13} />}
        label='Opportunity'
        value={filters.opportunitySize}
        options={OPPORTUNITY_OPTIONS}
        onChange={(v) => onFiltersChange({ ...filters, opportunitySize: v })}
      />

      {/* Evidence Strength dropdown */}
      <FilterDropdown
        icon={<ShieldCheck size={13} />}
        label='Evidence'
        value={filters.evidenceStrength}
        options={EVIDENCE_OPTIONS}
        onChange={(v) => onFiltersChange({ ...filters, evidenceStrength: v })}
      />

      {/* Audience toggle group */}
      <AudienceToggle
        value={filters.audience}
        onChange={(v) => onFiltersChange({ ...filters, audience: v })}
        instanceId={instanceId}
      />

      {/* Filter status / clear */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className='flex items-center gap-2'
        >
          <span className='text-xs text-white/40'>
            {filteredCount} of {totalCount}
          </span>
          <button
            onClick={() =>
              onFiltersChange({
                opportunitySize: 'ALL',
                evidenceStrength: 'ALL',
                audience: 'ALL',
              })
            }
            className='text-xs text-white/40 underline underline-offset-2 transition-colors hover:text-white/60'
          >
            Clear
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};
