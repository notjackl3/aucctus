import { cn } from '@libs/utils/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface PaginationNav {
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}

interface WidgetHeaderProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  metadata?: React.ReactNode;
  pagination?: PaginationNav;
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  icon,
  label,
  description,
  metadata,
  pagination,
}) => (
  <div className='mb-3'>
    <div className='flex items-center gap-2'>
      <span className='flex h-3.5 w-3.5 items-center justify-center text-white/70'>
        {icon}
      </span>
      <span className='text-[10px] font-medium uppercase tracking-wider text-white/70'>
        {label}
      </span>
      {metadata && (
        <span className='text-[10px] text-white/30'>{metadata}</span>
      )}
      {pagination && pagination.total > 1 && (
        <div className='ml-auto flex items-center gap-1.5'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              pagination.onPrev();
            }}
            disabled={!pagination.canPrev}
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full border border-white/[0.1] transition-colors',
              pagination.canPrev
                ? 'text-white/50 hover:bg-white/[0.08] hover:text-white/70'
                : 'cursor-default text-white/15',
            )}
          >
            <ChevronLeft className='h-3 w-3' />
          </button>
          <span className='min-w-[24px] text-center text-[10px] tabular-nums text-white/30'>
            {pagination.currentIndex + 1}/{pagination.total}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              pagination.onNext();
            }}
            disabled={!pagination.canNext}
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full border border-white/[0.1] transition-colors',
              pagination.canNext
                ? 'text-white/50 hover:bg-white/[0.08] hover:text-white/70'
                : 'cursor-default text-white/15',
            )}
          >
            <ChevronRight className='h-3 w-3' />
          </button>
        </div>
      )}
    </div>
    {description && (
      <p className='mt-1 text-[11px] text-white/40'>{description}</p>
    )}
  </div>
);
