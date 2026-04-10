import type { IJTBDCustomWidget } from '@libs/api/types/jtbd';
import { DynamicIcon } from '@libs/utils/iconMap';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import { ItemSources } from './ItemSources';
import { WidgetHeader } from './WidgetHeader';
import { slideVariants } from './transitions';
import { usePagination } from './usePagination';

interface SparklineStatWidgetProps {
  widget: IJTBDCustomWidget;
}

function buildSparklinePath(
  data: number[],
  width: number,
  height: number,
): { linePath: string; areaPath: string; lastX: number; lastY: number } {
  if (data.length < 2)
    return { linePath: '', areaPath: '', lastX: 0, lastY: 0 };

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const padding = 4;
  const usableHeight = height - padding * 2;

  const points = data.map((v, i) => ({
    x: i * stepX,
    y: padding + usableHeight - ((v - min) / range) * usableHeight,
  }));

  const lineParts = points.map((p, i) =>
    i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`,
  );
  const linePath = lineParts.join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${height} L0,${height} Z`;
  const last = points[points.length - 1];

  return { linePath, areaPath, lastX: last.x, lastY: last.y };
}

export const SparklineStatWidget: React.FC<SparklineStatWidgetProps> = ({
  widget,
}) => {
  const items = [...widget.sparklineStatItems].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const pagination = usePagination(items.length);

  if (items.length === 0) return null;

  const item = items[pagination.currentIndex];
  const sparkW = 140;
  const sparkH = 48;
  const { linePath, areaPath, lastX, lastY } = buildSparklinePath(
    item.sparklineData,
    sparkW,
    sparkH,
  );

  const isPositive = item.changeDirection === 'up';
  const isNegative = item.changeDirection === 'down';
  const changeColor = isPositive
    ? 'text-emerald-400'
    : isNegative
      ? 'text-red-400'
      : 'text-white/60';
  const lineColor = isPositive ? '#34d399' : isNegative ? '#f87171' : '#9ca3af';
  const glowId = `sparkglow-${item.uuid}`;
  const gradId = `sparkgrad-${item.uuid}`;

  return (
    <div>
      <WidgetHeader
        icon={
          <DynamicIcon
            variant={widget.icon || 'activity'}
            className='h-3.5 w-3.5'
          />
        }
        label={widget.title || 'Search Volume'}
        description={widget.description}
        metadata={item.periodLabel}
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
            className='flex flex-col gap-3'
          >
            <div className='flex items-end justify-between gap-4'>
              <span
                className={cn('text-3xl font-bold leading-none', changeColor)}
              >
                {item.changeValue}
              </span>

              {linePath && (
                <svg
                  width={sparkW}
                  height={sparkH}
                  viewBox={`0 0 ${sparkW} ${sparkH}`}
                  className='shrink-0'
                >
                  <defs>
                    <linearGradient id={gradId} x1='0' x2='0' y1='0' y2='1'>
                      <stop
                        offset='0%'
                        stopColor={lineColor}
                        stopOpacity='0.25'
                      />
                      <stop
                        offset='100%'
                        stopColor={lineColor}
                        stopOpacity='0'
                      />
                    </linearGradient>
                    <filter id={glowId}>
                      <feGaussianBlur stdDeviation='3' result='blur' />
                      <feMerge>
                        <feMergeNode in='blur' />
                        <feMergeNode in='SourceGraphic' />
                      </feMerge>
                    </filter>
                  </defs>
                  <path d={areaPath} fill={`url(#${gradId})`} />
                  <path
                    d={linePath}
                    fill='none'
                    stroke={lineColor}
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <circle
                    cx={lastX}
                    cy={lastY}
                    r='3'
                    fill={lineColor}
                    filter={`url(#${glowId})`}
                  />
                </svg>
              )}
            </div>

            {item.keywordTags.length > 0 && (
              <div className='flex flex-wrap gap-1.5'>
                {item.keywordTags.map((tag) => (
                  <span
                    key={tag}
                    className='rounded-full border border-white/[0.06] bg-white/[0.08] px-2 py-0.5 text-[10px] text-white/50'
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <ItemSources sources={item.sources} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
