import React, { useState } from 'react';
import MonteCarloVisualization from './MonteCarloVisualization';
import { generateMonteCarloData } from '../../shared/monteCarloUtils';
import { cn } from '@libs/utils/react';

interface MonteCarloChartProps {
  initialInvestment?: number;
  timeHorizon?: number;
  className?: string;
  hideTitle?: boolean;
}

const MonteCarloChart: React.FC<MonteCarloChartProps> = ({
  initialInvestment = 250000,
  timeHorizon = 24,
  className = '',
  hideTitle = false,
}) => {
  const [meanReturn, setMeanReturn] = useState(1.5); // monthly return percentage
  const [stdDev, setStdDev] = useState(3); // standard deviation percentage
  const [months, setMonths] = useState(timeHorizon);
  const [simulations, setSimulations] = useState(500); // number of simulations

  // Generate data based on current settings
  const chartData = generateMonteCarloData(
    months,
    initialInvestment,
    meanReturn,
    stdDev,
  );

  return (
    <div
      className={cn(
        'aucctus-bg-primary aucctus-border-secondary overflow-hidden rounded-lg border p-2',
        className,
      )}
    >
      <div className='p-4'>
        <div className='flex h-full flex-col'>
          {!hideTitle && (
            <div className='mb-3'>
              <h3 className='aucctus-header-xs-medium aucctus-text-primary'>
                Monte Carlo Revenue Simulation
              </h3>
              <p className='aucctus-text-sm aucctus-text-tertiary'>
                {simulations} simulations over {months} months
              </p>
            </div>
          )}

          {/* Chart Visualization */}
          <MonteCarloVisualization
            chartData={chartData}
            initialInvestment={initialInvestment}
          />

          {/* Chart Legend */}
          <div className='mt-4 grid grid-cols-2 gap-3 md:grid-cols-4'>
            <div className='flex items-center gap-2'>
              <div className='h-3 w-3 rounded-full bg-[#7c3aed]' />
              <span className='aucctus-text-xs aucctus-text-secondary'>
                Median (50%)
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-3 w-3 rounded-full bg-[#9f7aea]' />
              <span className='aucctus-text-xs aucctus-text-secondary'>
                80% Confidence
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-3 w-3 rounded-full bg-[#16a34a]' />
              <span className='aucctus-text-xs aucctus-text-secondary'>
                Best Case
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-3 w-3 rounded-full bg-[#dc2626]' />
              <span className='aucctus-text-xs aucctus-text-secondary'>
                Worst Case
              </span>
            </div>
          </div>

          {/* Sliders for simulation controls */}
          <div className='mt-6 space-y-4'>
            {/* First row of sliders */}
            <div className='flex gap-4'>
              <div className='flex-1'>
                <div className='mb-1 flex justify-between'>
                  <span className='aucctus-text-xs aucctus-text-tertiary'>
                    Months
                  </span>
                  <span className='aucctus-text-xs-semibold aucctus-text-primary'>
                    {months}
                  </span>
                </div>
                <input
                  type='range'
                  min='6'
                  max='60'
                  step='6'
                  value={months}
                  onChange={(e) => setMonths(parseInt(e.target.value))}
                  className='aucctus-slider-brand aucctus-bg-brand-primary-alt h-1 w-full rounded'
                />
              </div>
              <div className='flex-1'>
                <div className='mb-1 flex justify-between'>
                  <span className='aucctus-text-xs aucctus-text-tertiary'>
                    Simulations
                  </span>
                  <span className='aucctus-text-xs-semibold aucctus-text-primary'>
                    {simulations}
                  </span>
                </div>
                <input
                  type='range'
                  min='100'
                  max='1000'
                  step='100'
                  value={simulations}
                  onChange={(e) => setSimulations(parseInt(e.target.value))}
                  className='aucctus-slider-brand aucctus-bg-brand-primary-alt h-1 w-full rounded'
                />
              </div>
            </div>

            {/* Second row of sliders */}
            <div className='flex gap-4'>
              <div className='flex-1'>
                <div className='mb-1 flex justify-between'>
                  <span className='aucctus-text-xs aucctus-text-tertiary'>
                    Mean Monthly Return
                  </span>
                  <span className='aucctus-text-xs-semibold aucctus-text-primary'>
                    {meanReturn}%
                  </span>
                </div>
                <input
                  type='range'
                  min='0.1'
                  max='5'
                  step='0.1'
                  value={meanReturn}
                  onChange={(e) => setMeanReturn(parseFloat(e.target.value))}
                  className='aucctus-slider-brand aucctus-bg-brand-primary-alt h-1 w-full rounded'
                />
              </div>
              <div className='flex-1'>
                <div className='mb-1 flex justify-between'>
                  <span className='aucctus-text-xs aucctus-text-tertiary'>
                    Standard Deviation
                  </span>
                  <span className='aucctus-text-xs-semibold aucctus-text-primary'>
                    {stdDev}%
                  </span>
                </div>
                <input
                  type='range'
                  min='1'
                  max='10'
                  step='0.5'
                  value={stdDev}
                  onChange={(e) => setStdDev(parseFloat(e.target.value))}
                  className='aucctus-slider-brand aucctus-bg-brand-primary-alt h-1 w-full rounded'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonteCarloChart;
