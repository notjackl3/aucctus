import React from 'react';
import { ComponentTooltip } from '@components';
import { cn } from '@libs/utils/react';
import MeterSquares from './MeterSquares';
import { DynamicIcon } from '@libs/utils/iconMap';

type MeterType = 'certainty' | 'importance';

interface MeterConfig {
  icon: 'activity' | 'alert-circle';
  label: string;
  tooltip: string;
  colors: {
    high: { text: string; blocks: string[] };
    medium: { text: string; blocks: string[] };
    low: { text: string; blocks: string[] };
  };
}

const METER_CONFIGS: Record<MeterType, MeterConfig> = {
  certainty: {
    icon: 'activity',
    label: 'Certainty',
    tooltip: 'How certain we are that this assumption is valid.',
    colors: {
      high: {
        text: 'text-green-600',
        blocks: ['bg-green-600', 'bg-green-600', 'bg-green-600'],
      },
      medium: {
        text: 'text-yellow-500',
        blocks: ['bg-yellow-400', 'bg-yellow-400', 'bg-gray-200'],
      },
      low: {
        text: 'text-red-500',
        blocks: ['bg-red-500', 'bg-gray-200', 'bg-gray-200'],
      },
    },
  },
  importance: {
    icon: 'alert-circle',
    label: 'Importance',
    tooltip: "How important this assumption is to the concept's success.",
    colors: {
      high: {
        text: 'text-red-500',
        blocks: ['bg-red-500', 'bg-red-500', 'bg-red-500'],
      },
      medium: {
        text: 'text-yellow-500',
        blocks: ['bg-yellow-400', 'bg-yellow-400', 'bg-gray-200'],
      },
      low: {
        text: 'text-green-600',
        blocks: ['bg-green-600', 'bg-gray-200', 'bg-gray-200'],
      },
    },
  },
};

interface GenericMeterProps {
  type: MeterType;
  value: number;
}

const GenericMeter: React.FC<GenericMeterProps> = ({ type, value }) => {
  const config = METER_CONFIGS[type];

  // Determine level based on the value
  const getLevel = (val: number): 'high' | 'medium' | 'low' => {
    if (val >= 66) return 'high';
    if (val >= 33) return 'medium';
    return 'low';
  };

  const level = getLevel(value);
  const levelColors = config.colors[level];

  return (
    <ComponentTooltip
      tip={
        <div className='aucctus-bg-primary aucctus-border-secondary max-w-xs rounded-lg border p-4 shadow-lg'>
          <p className='aucctus-text-xs aucctus-text-secondary leading-relaxed'>
            {config.tooltip}
          </p>
        </div>
      }
    >
      <div className='aucctus-bg-secondary aucctus-border-tertiary inline-block rounded p-2'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center'>
            <DynamicIcon
              variant={config.icon}
              className='aucctus-stroke-tertiary mr-1.5 h-3.5 w-3.5'
            />
            <span className='aucctus-text-primary aucctus-text-xs-medium'>
              {config.label}
            </span>
          </div>
          <div className='flex items-center space-x-1.5'>
            <MeterSquares value={value} blockColors={levelColors.blocks} />
            <span className={cn('aucctus-text-xs-medium', levelColors.text)}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </ComponentTooltip>
  );
};

export default GenericMeter;
