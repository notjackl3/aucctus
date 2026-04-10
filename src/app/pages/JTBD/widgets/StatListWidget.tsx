import type { IJTBDCustomWidget, JTBDTrend } from '@libs/api/types/jtbd';
import { DynamicIcon } from '@libs/utils/iconMap';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';

import { ItemSources } from './ItemSources';
import { WidgetHeader } from './WidgetHeader';
import { slideVariants } from './transitions';
import { usePagination } from './usePagination';

const trendConfig: Record<
  JTBDTrend,
  { icon: React.ElementType; color: string; label: string }
> = {
  up: { icon: TrendingUp, color: 'text-emerald-400', label: 'Rising' },
  down: { icon: TrendingDown, color: 'text-red-400', label: 'Declining' },
  stable: { icon: Minus, color: 'text-white/40', label: 'Stable' },
};

interface StatListWidgetProps {
  widget: IJTBDCustomWidget;
}

export const StatListWidget: React.FC<StatListWidgetProps> = ({ widget }) => {
  const items = [...widget.statListItems].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const pagination = usePagination(items.length);

  if (items.length === 0) return null;

  const item = items[pagination.currentIndex];
  const trend = trendConfig[item.trend];
  const TrendIcon = trend.icon;

  return (
    <div>
      <WidgetHeader
        icon={
          <DynamicIcon
            variant={widget.icon || 'bar-chart-3'}
            className='h-3.5 w-3.5'
          />
        }
        label={widget.title || 'Key Stats'}
        description={widget.description}
        pagination={{
          currentIndex: pagination.currentIndex,
          total: pagination.total,
          onPrev: pagination.prev,
          onNext: pagination.next,
          canPrev: pagination.canPrev,
          canNext: pagination.canNext,
        }}
      />

      <div className='overflow-hidden'>
        <AnimatePresence mode='wait' custom={pagination.direction}>
          <motion.div
            key={item.uuid}
            custom={pagination.direction}
            variants={slideVariants}
            initial='enter'
            animate='center'
            exit='exit'
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className='mb-1.5 flex items-start justify-between gap-2'>
              <h4 className='flex-1 text-sm font-medium leading-snug text-white/80'>
                {item.title}
              </h4>
              <div
                className={cn('flex shrink-0 items-center gap-1', trend.color)}
              >
                <TrendIcon className='h-3.5 w-3.5' />
                <span className='text-[10px] font-medium'>{trend.label}</span>
              </div>
            </div>
            <p className='line-clamp-3 text-xs leading-snug text-white/45'>
              {item.description}
            </p>
            <ItemSources sources={item.sources} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
