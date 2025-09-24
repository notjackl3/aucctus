import { Icon } from '@components';
import React, { useState } from 'react';

interface ChartData {
  name: string;
  value: number;
  ratio: number;
  id: string;
}

interface PersonaDistribution {
  id: string;
  segment: string;
  count: number;
  color: string;
}

interface ParticipantChartProps {
  totalParticipants: number;
  chartData: ChartData[];
  personaDistribution: PersonaDistribution[];
  onTotalParticipantsChange: (newValue: number) => void;
  onSubmitTotalParticipants: () => Promise<void>;
  isUpdating: boolean;
}

// Colors for the donut chart segments
const COLORS = ['#FF8A00', '#00C853', '#00B0FF', '#AA00FF'];

const ParticipantChart: React.FC<ParticipantChartProps> = ({
  totalParticipants,
  chartData,
  personaDistribution,
  onTotalParticipantsChange,
  onSubmitTotalParticipants,
  isUpdating,
}) => {
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [localTotalParticipants, setLocalTotalParticipants] =
    useState(totalParticipants);

  React.useEffect(() => {
    setLocalTotalParticipants(totalParticipants);
  }, [totalParticipants]);

  const handleTotalParticipantsChange = (newValue: number) => {
    if (newValue < 0) {
      newValue = 0;
    }
    setLocalTotalParticipants(newValue);
    onTotalParticipantsChange(newValue);
  };

  const handleSubmitTotalParticipants = async () => {
    await onSubmitTotalParticipants();
    setIsEditingTotal(false);
  };

  return (
    <div className='aucctus-border-secondary aucctus-bg-primary rounded-lg border p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary'>
          Who to engage
        </h4>
        {isEditingTotal ? (
          <div className='flex items-center gap-2'>
            <input
              type='number'
              className='aucctus-border-secondary aucctus-text-sm w-20 rounded border p-2 text-center'
              value={localTotalParticipants}
              onChange={(e) =>
                handleTotalParticipantsChange(parseInt(e.target.value) || 0)
              }
              min={0}
              autoFocus
              disabled={isUpdating}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmitTotalParticipants();
                } else if (e.key === 'Escape') {
                  setIsEditingTotal(false);
                }
              }}
            />
            <button
              className='btn btn-success btn-sm'
              onClick={handleSubmitTotalParticipants}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Icon
                  variant='refresh'
                  className='aucctus-stroke-white h-4 w-4 animate-spin'
                />
              ) : (
                <Icon
                  variant='check'
                  className='aucctus-stroke-white h-4 w-4'
                />
              )}
            </button>
            <button
              className='btn btn-secondary btn-sm'
              onClick={() => setIsEditingTotal(false)}
              disabled={isUpdating}
            >
              <Icon
                variant='closeX'
                className='aucctus-stroke-secondary h-4 w-4'
              />
            </button>
          </div>
        ) : (
          <button
            className='btn btn-secondary btn-sm flex items-center gap-1'
            onClick={() => setIsEditingTotal(true)}
          >
            <Icon variant='edit' className='aucctus-stroke-secondary h-4 w-4' />
            Edit
          </button>
        )}
      </div>

      {/* Donut Chart Area */}
      <div className='relative mb-6 flex h-72 flex-col items-center justify-center'>
        {/* SVG Donut Chart */}
        <div className='relative'>
          <svg width='200' height='200' className='-rotate-90 transform'>
            <circle
              cx='100'
              cy='100'
              r='80'
              fill='none'
              stroke='#f1f5f9'
              strokeWidth='30'
            />
            {chartData.map((segment, index) => {
              const circumference = 2 * Math.PI * 80;
              const strokeDasharray =
                (segment.value / totalParticipants) * circumference;
              const rotation = chartData
                .slice(0, index)
                .reduce(
                  (acc, prev) => acc + (prev.value / totalParticipants) * 360,
                  0,
                );

              return (
                <circle
                  key={segment.id}
                  cx='100'
                  cy='100'
                  r='80'
                  fill='none'
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth='30'
                  strokeDasharray={`${strokeDasharray} ${circumference}`}
                  strokeDashoffset='0'
                  style={{
                    transformOrigin: '100px 100px',
                    transform: `rotate(${rotation}deg)`,
                  }}
                />
              );
            })}
          </svg>

          {/* Center Total */}
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-center'>
              <div className='aucctus-text-2xl-bold aucctus-text-brand-primary'>
                {totalParticipants}
              </div>
              <div className='aucctus-text-xs-regular aucctus-text-secondary'>
                Total
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        {personaDistribution.length > 0 && (
          <div className='mt-4 grid w-full grid-cols-2 gap-3'>
            {personaDistribution
              .filter((p) => p.count > 0)
              .map((persona, personaIndex) => (
                <div key={persona.id} className='flex items-center gap-2'>
                  <div
                    className='h-3 w-3 rounded-full'
                    style={{
                      backgroundColor: COLORS[personaIndex % COLORS.length],
                    }}
                  />
                  <span className='aucctus-text-xs-regular aucctus-text-secondary truncate'>
                    {persona.segment.split(' ')[0]}
                  </span>
                  <span className='aucctus-text-xs-semibold aucctus-text-brand-primary'>
                    {persona.count}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className='aucctus-bg-secondary-subtle rounded-lg p-4'>
        <h5 className='aucctus-text-sm-semibold aucctus-text-brand-primary mb-2'>
          Number of participants
        </h5>
        <p className='aucctus-text-sm-regular aucctus-text-secondary'>
          For customer interviews, a panel size of {totalParticipants}{' '}
          respondents is recommended for qualitative insights.
        </p>
      </div>
    </div>
  );
};

export default ParticipantChart;
