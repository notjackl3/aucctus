/* eslint-disable react/prop-types */
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { IProfileDistribution } from '@libs/api/types/concept/testing';

interface DistributionChartProps {
  data: IProfileDistribution[];
  totalTests: number;
  isLoading?: boolean;
}

// Aucctus theme colors for chart segments
const CHART_COLORS = [
  '#5A66DF', // Primary brand color
  '#FF6B35', // Orange/Active color
  '#00C896', // Success/Green color
  '#8B5CF6', // Purple/Research color
  '#06B6D4', // Cyan/Performance color
  '#F59E0B', // Amber/Warning color
  '#EF4444', // Red/Error color
  '#6B7280', // Gray fallback
];

const DistributionChart: React.FC<DistributionChartProps> = ({
  data,
  totalTests,
  isLoading = false,
}) => {
  // Transform data for Recharts
  const chartData = data.map((profile, index) => ({
    name: profile.profileName,
    value: profile.testCount,
    percentage: Math.round((profile.testCount / totalTests) * 100),
    isPrimary: profile.isPrimary,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  // Custom tooltip component
  const CustomTooltip: React.FC<{
    active?: boolean;
    payload?: Array<{ payload: (typeof chartData)[0] }>;
  }> = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border px-3 py-2 shadow-lg'>
          <p className='aucctus-text-sm aucctus-text-primary'>
            {data.name} — {data.value} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend component
  const CustomLegend: React.FC<{ payload: typeof chartData }> = ({
    payload,
  }) => (
    <div className='space-y-1.5'>
      {payload.map((entry, index) => (
        <div key={index} className='flex items-center gap-2 text-sm'>
          <div
            className='h-2.5 w-2.5 flex-shrink-0 rounded-full'
            style={{ backgroundColor: entry.color }}
          />
          <span className='aucctus-text-sm aucctus-text-primary min-w-0 flex-1 truncate'>
            {entry.name}
            {entry.isPrimary && (
              <span className='aucctus-text-xs aucctus-text-brand-primary ml-1'>
                (Primary)
              </span>
            )}
          </span>
          <span className='aucctus-text-xs aucctus-text-secondary flex-shrink-0'>
            {entry.value} ({entry.percentage}%)
          </span>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='aucctus-text-sm aucctus-text-secondary'>
          Loading distribution...
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='aucctus-text-sm aucctus-text-secondary'>
          No distribution data available
        </div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      {/* Chart and Legend Container */}
      <div className='flex flex-col items-center gap-4 md:flex-row'>
        {/* Chart Container */}
        <div className='relative h-48 w-48 flex-shrink-0'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={chartData}
                cx='50%'
                cy='50%'
                innerRadius={40}
                outerRadius={75}
                paddingAngle={2}
                dataKey='value'
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text showing total */}
          <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
            <div className='text-center'>
              <div className='aucctus-text-lg-bold aucctus-text-primary'>
                {totalTests}
              </div>
              <div className='aucctus-text-xs aucctus-text-secondary'>
                Total
              </div>
            </div>
          </div>
        </div>

        {/* Legend on the right */}
        <div className='min-w-0 flex-1'>
          <CustomLegend payload={chartData} />
        </div>
      </div>
    </div>
  );
};

export default DistributionChart;
