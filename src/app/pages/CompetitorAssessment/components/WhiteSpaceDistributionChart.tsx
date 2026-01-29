import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Icon } from '@components';
import type { IWhiteSpaceOpportunity } from '@libs/api/types/competitorAssessment';

interface WhiteSpaceDistributionChartProps {
  whiteSpaces: IWhiteSpaceOpportunity[];
}

const urgencyConfig: Record<string, { color: string; label: string }> = {
  immediate: { color: '#ef4444', label: 'Immediate' },
  strategic: { color: '#f59e0b', label: 'Strategic' },
  exploratory: { color: '#3b82f6', label: 'Exploratory' },
};

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number; color: string } }>;
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-3 shadow-lg'>
        <div className='flex items-center gap-2'>
          <div
            className='h-2.5 w-2.5 rounded-full'
            style={{ backgroundColor: data.color }}
          />
          <span className='aucctus-text-primary aucctus-text-sm-semibold'>
            {data.name}
          </span>
        </div>
        <p className='aucctus-text-secondary mt-1 text-xs'>
          {data.value} {data.value === 1 ? 'opportunity' : 'opportunities'}
        </p>
      </div>
    );
  }
  return null;
};

const WhiteSpaceDistributionChart: React.FC<
  WhiteSpaceDistributionChartProps
> = ({ whiteSpaces }) => {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {
      immediate: 0,
      strategic: 0,
      exploratory: 0,
    };
    whiteSpaces.forEach((ws) => {
      counts[ws.urgency] = (counts[ws.urgency] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([key, count]) => ({
        name: urgencyConfig[key]?.label || key,
        value: count,
        color: urgencyConfig[key]?.color || '#6b7280',
      }));
  }, [whiteSpaces]);

  const avgScore = useMemo(() => {
    if (whiteSpaces.length === 0) return 0;
    return Math.round(
      whiteSpaces.reduce((sum, ws) => sum + ws.opportunityScore, 0) /
        whiteSpaces.length,
    );
  }, [whiteSpaces]);

  if (whiteSpaces.length === 0) {
    return (
      <div className='aucctus-bg-primary aucctus-border-secondary flex h-full items-center justify-center rounded-xl border p-8'>
        <p className='aucctus-text-tertiary text-sm'>
          No white spaces discovered yet
        </p>
      </div>
    );
  }

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border p-2'>
      <div className='p-4'>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h3 className='aucctus-header-xs-medium aucctus-text-primary'>
              White Space Distribution
            </h3>
            <p className='aucctus-text-xs aucctus-text-tertiary mt-0.5'>
              Opportunities by urgency level
            </p>
          </div>
          <div className='flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1'>
            <Icon
              variant='star-01'
              height={12}
              width={12}
              className='stroke-amber-500'
            />
            <span className='aucctus-text-tertiary text-[10px]'>
              Avg score: {avgScore}
            </span>
          </div>
        </div>

        <div className='relative h-56 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={chartData}
                cx='50%'
                cy='50%'
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey='value'
                animationDuration={800}
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
            <span className='aucctus-text-primary text-2xl font-bold'>
              {whiteSpaces.length}
            </span>
            <span className='aucctus-text-tertiary text-[10px]'>Total</span>
          </div>
        </div>

        <div className='mt-3 flex items-center justify-center gap-5'>
          {chartData.map((item) => (
            <div key={item.name} className='flex items-center gap-1.5'>
              <div
                className='h-2 w-2 rounded-full'
                style={{ backgroundColor: item.color }}
              />
              <span className='aucctus-text-xs aucctus-text-tertiary'>
                {item.name} ({item.value})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhiteSpaceDistributionChart;
