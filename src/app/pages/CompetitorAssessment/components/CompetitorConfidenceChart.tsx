import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Icon } from '@components';
import type { ICompetitor } from '@libs/api/types/competitorAssessment';

interface CompetitorConfidenceChartProps {
  competitors: ICompetitor[];
}

const getBarColor = (score: number, isYourCompany: boolean): string => {
  if (isYourCompany) return '#f59e0b';
  if (score >= 70) return '#22c55e';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      score: number;
      confidence: string;
      isYourCompany: boolean;
    };
  }>;
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-3 shadow-lg'>
        <p className='aucctus-text-primary aucctus-text-sm-semibold mb-1'>
          {data.name}
          {data.isYourCompany && (
            <span className='ml-1.5 text-[10px] text-amber-400'>(You)</span>
          )}
        </p>
        <div className='flex items-center justify-between gap-4'>
          <span className='aucctus-text-xs aucctus-text-secondary'>
            Confidence:
          </span>
          <span
            className='aucctus-text-xs-semibold'
            style={{ color: getBarColor(data.score, false) }}
          >
            {data.score}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const CompetitorConfidenceChart: React.FC<CompetitorConfidenceChartProps> = ({
  competitors,
}) => {
  const chartData = useMemo(() => {
    return competitors
      .filter((c) => c.assessment)
      .map((c) => ({
        name: c.name.length > 14 ? c.name.slice(0, 12) + '...' : c.name,
        fullName: c.name,
        score: c.assessment!.confidenceScore,
        confidence: c.assessment!.confidence,
        isYourCompany: c.isYourCompany,
      }))
      .sort((a, b) => b.score - a.score);
  }, [competitors]);

  const avgScore = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.round(
      chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length,
    );
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className='aucctus-bg-primary aucctus-border-secondary flex h-full items-center justify-center rounded-xl border p-8'>
        <p className='aucctus-text-tertiary text-sm'>
          No confidence data available
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
              Confidence Scores
            </h3>
            <p className='aucctus-text-xs aucctus-text-tertiary mt-0.5'>
              Research confidence by competitor
            </p>
          </div>
          <div className='flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1'>
            <Icon
              variant='barchart'
              height={12}
              width={12}
              className='aucctus-stroke-tertiary'
            />
            <span className='aucctus-text-tertiary text-[10px]'>
              Avg: {avgScore}%
            </span>
          </div>
        </div>

        <div className='h-56 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={chartData}
              layout='vertical'
              margin={{ top: 4, right: 20, left: 4, bottom: 4 }}
            >
              <XAxis
                type='number'
                domain={[0, 100]}
                stroke='currentColor'
                opacity={0.3}
                tick={{ fontSize: 10 }}
                axisLine={{ stroke: 'currentColor', opacity: 0.1 }}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <YAxis
                type='category'
                dataKey='name'
                stroke='currentColor'
                opacity={0.5}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <ReferenceLine
                x={avgScore}
                stroke='currentColor'
                strokeOpacity={0.2}
                strokeDasharray='3 3'
              />
              <Bar
                dataKey='score'
                radius={[0, 6, 6, 0]}
                barSize={18}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={getBarColor(entry.score, entry.isYourCompany)}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className='mt-3 flex items-center gap-4'>
          {[
            { color: '#22c55e', label: 'High (70+)' },
            { color: '#f59e0b', label: 'Medium (40-69)' },
            { color: '#ef4444', label: 'Low (<40)' },
          ].map((item) => (
            <div key={item.label} className='flex items-center gap-1.5'>
              <div
                className='h-2 w-2 rounded-full'
                style={{ backgroundColor: item.color }}
              />
              <span className='aucctus-text-xs aucctus-text-tertiary'>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompetitorConfidenceChart;
