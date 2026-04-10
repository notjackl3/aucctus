import type { IJTBDCustomWidget } from '@libs/api/types/jtbd';
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

  const data = items.map((item) => ({
    name: item.label,
    value: item.magnitude,
    unit: item.unit,
    valueLabel: `${item.magnitude}${item.unit}`,
  }));

  if (widget.chartType === 'pie') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className='flex flex-col items-center gap-4'
      >
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
            <Tooltip
              contentStyle={{
                background: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                color: 'white',
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => [
                `${value} ${data.find((d) => d.name === name)?.unit ?? ''}`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className='flex flex-wrap justify-center gap-3'>
          {data.map((item, i) => (
            <div key={i} className='flex items-center gap-1.5'>
              <div
                className='h-2.5 w-2.5 rounded-full'
                style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
              />
              <span className='text-[11px] text-white/60'>
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
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(0,0,0,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              color: 'white',
              fontSize: 12,
            }}
            formatter={(value: number, name: string) => [
              `${value}${data.find((d) => d.name === name)?.unit ?? ''}`,
              name,
            ]}
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
