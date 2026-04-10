import type {
  IJTBDCustomWidget,
  IJTBDMarketSizingItem,
} from '@libs/api/types/jtbd';
import { DynamicIcon } from '@libs/utils/iconMap';
import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import React from 'react';

import { ItemSources } from './ItemSources';
import { WidgetHeader } from './WidgetHeader';

// ============================================
// Color config per metric tier
// Follows the MarketSizeVisualization palette:
// TAM = blue, SAM = indigo, SOM = purple
// ============================================

const metricConfig: Record<
  IJTBDMarketSizingItem['metric'],
  {
    barBg: string;
    borderColor: string;
    textColor: string;
    labelColor: string;
  }
> = {
  tam: {
    barBg: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-300',
    labelColor: 'text-blue-300/70',
  },
  sam: {
    barBg: 'bg-indigo-500/20',
    borderColor: 'border-indigo-500/25',
    textColor: 'text-indigo-300',
    labelColor: 'text-indigo-300/80',
  },
  som: {
    barBg: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-300',
    labelColor: 'text-purple-300/70',
  },
};

// ============================================
// Helpers
// ============================================

function computeBarWidths(items: IJTBDMarketSizingItem[]): Map<string, number> {
  const widths = new Map<string, number>();
  const tamItem = items.find((i) => i.metric === 'tam');
  const tamValue = tamItem?.value ?? 0;

  for (const item of items) {
    if (tamValue <= 0 || item.value == null) {
      widths.set(item.uuid, item.metric === 'tam' ? 100 : 12);
    } else {
      const pct = (item.value / tamValue) * 100;
      // Clamp to a minimum of 12% so tiny values remain visible
      widths.set(item.uuid, Math.max(pct, 12));
    }
  }

  return widths;
}

// ============================================
// MarketSizingWidget
// ============================================

interface MarketSizingWidgetProps {
  widget: IJTBDCustomWidget;
}

export const MarketSizingWidget: React.FC<MarketSizingWidgetProps> = ({
  widget,
}) => {
  const items = [...widget.marketSizingItems].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  if (items.length === 0) return null;

  const barWidths = computeBarWidths(items);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <WidgetHeader
        icon={
          <DynamicIcon
            variant={widget.icon || 'bar-chart-3'}
            className='h-3.5 w-3.5'
          />
        }
        label={widget.title || 'Market Sizing'}
        description={widget.description}
      />

      <div className='flex flex-col gap-3'>
        {items.map((item, i) => {
          const config = metricConfig[item.metric];
          const widthPct = barWidths.get(item.uuid) ?? 100;

          return (
            <motion.div
              key={item.uuid}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className='flex flex-col gap-1'
            >
              {/* Metric label above bar */}
              <span
                className={cn(
                  'text-[9px] font-semibold uppercase tracking-wider',
                  config.labelColor,
                )}
              >
                {item.metric.toUpperCase()}
                {item.label && (
                  <span className='ml-1.5 font-normal normal-case tracking-normal text-white/30'>
                    {item.label}
                  </span>
                )}
              </span>

              {/* Colored bar with value inside */}
              <motion.div
                className={cn(
                  'rounded-md border px-3 py-2',
                  config.barBg,
                  config.borderColor,
                )}
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{
                  duration: 0.6,
                  ease: 'easeOut',
                  delay: i * 0.1,
                }}
              >
                <span
                  className={cn(
                    'whitespace-nowrap text-sm font-semibold',
                    config.textColor,
                  )}
                >
                  {item.formattedValue}
                </span>
              </motion.div>

              {/* Description */}
              {item.description && (
                <p className='text-[11px] leading-snug text-white/40'>
                  {item.description}
                </p>
              )}

              {/* Sources */}
              <ItemSources sources={item.sources} />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
