import type { IJTBDCustomWidget, IJTBDItemSource } from '@libs/api/types/jtbd';
import { DynamicIcon } from '@libs/utils/iconMap';
import { motion } from 'framer-motion';
import React from 'react';
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { BAR_COLORS, PIE_COLORS } from '../chartColors';
import { ItemSources } from './ItemSources';
import { WidgetHeader } from './WidgetHeader';

interface MetricDataItem {
  name: string;
  value: number;
  unit: string;
  valueLabel: string;
  sources: IJTBDItemSource[];
}

const BarChartTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MetricDataItem }>;
}) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-3 shadow-lg'>
      <p className='aucctus-text-primary aucctus-text-sm-semibold'>
        {data.name}
      </p>
      <p className='aucctus-text-secondary aucctus-text-xs mt-1'>
        {data.value}
        {data.unit}
      </p>
    </div>
  );
};

const PieChartTooltip = ({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: Array<{ payload: MetricDataItem }>;
  total: number;
}) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-3 shadow-lg'>
      <p className='aucctus-text-primary aucctus-text-sm-semibold'>
        {data.name}
      </p>
      <p className='aucctus-text-secondary aucctus-text-xs mt-1'>
        {data.value}
        {data.unit} ({percentage}%)
      </p>
    </div>
  );
};

interface MetricChartWidgetProps {
  widget: IJTBDCustomWidget;
}

export const MetricChartWidget: React.FC<MetricChartWidgetProps> = ({
  widget,
}) => {
  const items = [...widget.metricChartItems].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  if (items.length === 0) return null;

  const data: MetricDataItem[] = items.map((item) => ({
    name: item.label,
    value: item.magnitude,
    unit: item.unit,
    valueLabel: `${item.magnitude}${item.unit}`,
    sources: item.sources,
  }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (widget.chartType === 'pie') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className='flex flex-col gap-4'
      >
        <WidgetHeader
          icon={
            <DynamicIcon
              variant={widget.icon || 'pie-chart'}
              className='h-3.5 w-3.5'
            />
          }
          label={widget.title || 'Metrics'}
          description={widget.description}
        />
        <ResponsiveContainer width='100%' height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey='value'
              nameKey='name'
              cx='50%'
              cy='50%'
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              animationDuration={800}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={PIE_COLORS[i % PIE_COLORS.length]}
                  stroke='transparent'
                />
              ))}
            </Pie>
            <Tooltip content={<PieChartTooltip total={total} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className='flex flex-wrap justify-center gap-3'>
          {data.map((item, i) => (
            <div key={i} className='flex items-center gap-1.5'>
              <div
                className='h-2.5 w-2.5 rounded-full'
                style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
              />
              <span className='line-clamp-1 text-[11px] text-white/60'>
                {item.name} ({item.valueLabel})
              </span>
            </div>
          ))}
        </div>
        <ItemSources sources={items.flatMap((item) => item.sources)} />
      </motion.div>
    );
  }

  // Default: BAR chart
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
        label={widget.title || 'Metrics'}
        description={widget.description}
      />
      {(widget.topScaleLabel || widget.bottomScaleLabel) && (
        <div className='mb-1 flex justify-between text-[10px] text-white/40'>
          {widget.bottomScaleLabel && <span>{widget.bottomScaleLabel}</span>}
          {widget.topScaleLabel && (
            <span className='ml-auto'>{widget.topScaleLabel}</span>
          )}
        </div>
      )}
      <ResponsiveContainer
        width='100%'
        height={Math.max(items.length * 36, 120)}
      >
        <BarChart data={data} layout='vertical' margin={{ left: 0, right: 40 }}>
          <XAxis type='number' hide />
          <YAxis
            type='category'
            dataKey='name'
            width={100}
            tick={({
              x,
              y,
              payload,
            }: {
              x: number;
              y: number;
              payload: { value: string };
            }) => (
              <foreignObject x={x - 100} y={y - 10} width={96} height={20}>
                <div
                  className='line-clamp-1 text-right text-[11px] leading-[20px]'
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                  title={payload.value}
                >
                  {payload.value}
                </div>
              </foreignObject>
            )}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<BarChartTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Bar dataKey='value' radius={[0, 4, 4, 0]} animationDuration={800}>
            {data.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
            <LabelList
              dataKey='valueLabel'
              position='right'
              style={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <ItemSources sources={items.flatMap((item) => item.sources)} />
    </motion.div>
  );
};
