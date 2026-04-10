import type { IJTBDCustomWidget } from '@libs/api/types/jtbd';
import { motion } from 'framer-motion';
import React, { useId } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { TREND_DOT_FILL, TREND_LINE_COLOR } from '../chartColors';
import { ItemSources } from './ItemSources';

interface TrendChartWidgetProps {
  widget: IJTBDCustomWidget;
}

export const TrendChartWidget: React.FC<TrendChartWidgetProps> = ({
  widget,
}) => {
  const reactId = useId();
  const gradientId = `trendFill-${reactId.replace(/:/g, '')}`;

  const items = [...widget.trendChartItems].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  if (items.length === 0) return null;

  const data = items.map((item) => ({
    period: item.period,
    value: item.value,
    label: item.label,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {widget.topScaleLabel && (
        <div className='mb-1 text-[10px] text-white/40'>
          {widget.topScaleLabel}
        </div>
      )}
      <ResponsiveContainer width='100%' height={180}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
              <stop
                offset='0%'
                stopColor={TREND_LINE_COLOR}
                stopOpacity={0.3}
              />
              <stop
                offset='100%'
                stopColor={TREND_LINE_COLOR}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <XAxis
            dataKey='period'
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: 'rgba(0,0,0,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              color: 'white',
              fontSize: 12,
            }}
            formatter={(value: number) => [value, 'Value']}
            labelFormatter={(label: string) => label}
          />
          <Area
            type='monotone'
            dataKey='value'
            stroke={TREND_LINE_COLOR}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            animationDuration={800}
            dot={{
              r: 3,
              fill: TREND_DOT_FILL,
              stroke: TREND_LINE_COLOR,
              strokeWidth: 2,
            }}
            activeDot={{
              r: 5,
              fill: TREND_LINE_COLOR,
              stroke: TREND_DOT_FILL,
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
      {widget.bottomScaleLabel && (
        <div className='mt-1 text-[10px] text-white/40'>
          {widget.bottomScaleLabel}
        </div>
      )}
      <ItemSources sources={items.flatMap((item) => item.sources)} />
    </motion.div>
  );
};
