import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatCurrency } from '../../shared/monteCarloUtils';

interface MonteCarloVisualizationProps {
  chartData: any[];
  initialInvestment: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey: string;
    payload: any;
  }>;
  label?: string;
}

// Custom tooltip component
const MonteCarloTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className='aucctus-bg-primary aucctus-border-secondary rounded border p-3 shadow-md'>
        <p className='aucctus-text-sm-semibold aucctus-text-primary mb-1'>
          Month {label}
        </p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className='flex justify-between gap-4'>
            <span className='aucctus-text-xs aucctus-text-secondary'>
              {entry.name}:
            </span>
            <span className='aucctus-text-xs-semibold aucctus-text-primary'>
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

const MonteCarloVisualization: React.FC<MonteCarloVisualizationProps> = ({
  chartData,
  initialInvestment,
}) => {
  return (
    <div className='aucctus-bg-primary h-72 w-full rounded-lg p-2'>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
        >
          <XAxis
            dataKey='month'
            tickFormatter={(value: number) => `${value}m`}
            stroke='currentColor'
            opacity={0.5}
            tick={{ fontSize: 11 }}
            axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
            tickLine={{ stroke: 'currentColor', opacity: 0.2 }}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis
            tickFormatter={(value: number) => `$${value / 1000}k`}
            stroke='currentColor'
            opacity={0.5}
            tick={{ fontSize: 11 }}
            axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
            tickLine={{ stroke: 'currentColor', opacity: 0.2 }}
            width={50}
            padding={{ top: 10, bottom: 10 }}
          />
          <Tooltip content={<MonteCarloTooltip />} />

          {/* Reference line for initial investment */}
          <ReferenceLine
            y={initialInvestment}
            stroke='#9f7aea'
            strokeDasharray='3 3'
            label={{
              value: 'Initial',
              position: 'insideBottomLeft',
              fill: '#9f7aea',
              fontSize: 10,
            }}
          />

          {/* Median line */}
          <Line
            type='monotone'
            dataKey='median'
            stroke='#7c3aed'
            strokeWidth={2.5}
            dot={false}
            animationDuration={1500}
            name='Median (50%)'
            activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
          />

          {/* Upper band - 90th percentile */}
          <Line
            type='monotone'
            dataKey='upper'
            stroke='#9f7aea'
            strokeWidth={1.5}
            strokeOpacity={0.7}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 1, stroke: '#fff' }}
            name='Upper (90%)'
          />

          {/* Lower band - 10th percentile */}
          <Line
            type='monotone'
            dataKey='lower'
            stroke='#9f7aea'
            strokeWidth={1.5}
            strokeOpacity={0.7}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 1, stroke: '#fff' }}
            name='Lower (10%)'
          />

          {/* Best case - 99th percentile */}
          <Line
            type='monotone'
            dataKey='best'
            stroke='#16a34a'
            strokeWidth={1.5}
            strokeDasharray='4 2'
            dot={false}
            activeDot={{ r: 4, strokeWidth: 1, stroke: '#fff' }}
            name='Best Case'
          />

          {/* Worst case - 1st percentile */}
          <Line
            type='monotone'
            dataKey='worst'
            stroke='#dc2626'
            strokeWidth={1.5}
            strokeDasharray='4 2'
            dot={false}
            activeDot={{ r: 4, strokeWidth: 1, stroke: '#fff' }}
            name='Worst Case'
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonteCarloVisualization;
