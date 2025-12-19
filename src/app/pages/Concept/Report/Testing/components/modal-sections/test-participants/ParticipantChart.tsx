import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
  ratio: number;
  id: string;
}

interface ParticipantChartProps {
  chartData: ChartData[];
}

// Colors for the donut chart segments - must match PersonaCard colors
const COLORS = ['#FF8A00', '#00C853', '#00B0FF', '#AA00FF'];

const ParticipantChart: React.FC<ParticipantChartProps> = ({ chartData }) => {
  const totalParticipants = React.useMemo(
    () => chartData.reduce((sum, segment) => sum + segment.value, 0),
    [chartData],
  );

  // Add originalIndex to chartData for consistent color mapping
  const chartDataWithIndex = React.useMemo(
    () => chartData.map((item, index) => ({ ...item, originalIndex: index })),
    [chartData],
  );

  // Custom tooltip to show persona name and participant count
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='aucctus-bg-primary aucctus-border-secondary rounded border p-2 shadow-sm'>
          <p className='aucctus-text-sm-medium aucctus-text-primary'>
            {data.name}
          </p>
          <p className='aucctus-text-xs aucctus-text-secondary'>
            {data.value} participants ({data.ratio}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className='relative flex h-[380px] items-center justify-center'>
      <ResponsiveContainer width='100%' height='100%'>
        <PieChart>
          <Pie
            data={chartDataWithIndex}
            cx='50%'
            cy='50%'
            innerRadius={100}
            outerRadius={140}
            fill='#8884d8'
            paddingAngle={3}
            dataKey='value'
            strokeWidth={0}
            cornerRadius={4}
          >
            {chartDataWithIndex.map((entry) => (
              <Cell
                key={`cell-${entry.id}`}
                fill={COLORS[entry.originalIndex % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className='absolute text-center'>
        <div className='aucctus-text-primary text-5xl font-bold'>
          {totalParticipants}
        </div>
        <div className='aucctus-text-secondary mt-1 text-sm'>participants</div>
      </div>
    </div>
  );
};

export default ParticipantChart;
