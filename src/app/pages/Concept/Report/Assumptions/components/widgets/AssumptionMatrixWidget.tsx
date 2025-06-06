import React, { useState } from 'react';
import { Icon, ComponentTooltip } from '@components';
import { cn } from '@libs/utils/react';
import {
  IAssumptionV2,
  RISK_ZONE_COLORS,
  CATEGORY_COLORS,
  AssumptionCategory,
} from '@libs/api/types';

interface AssumptionMatrixWidgetProps {
  assumptions: IAssumptionV2[];
  setSelectedAssumption: (assumption: IAssumptionV2) => void;
  className?: string;
}

const AssumptionMatrixWidget: React.FC<AssumptionMatrixWidgetProps> = ({
  assumptions,
  setSelectedAssumption,
  className,
}) => {
  const [activeRiskZone, setActiveRiskZone] = useState<string | null>('r1');

  const riskValues = assumptions.map((a) => a.risk);
  const minRisk = Math.min(...riskValues);
  const maxRisk = Math.max(...riskValues);

  const getDotSize = (risk: number) => {
    if (minRisk === maxRisk) return 'w-6 h-6 -ml-3 -mt-3';

    if (risk >= maxRisk - (maxRisk - minRisk) / 3) {
      return 'w-8 h-8 -ml-4 -mt-4';
    } else if (risk <= minRisk + (maxRisk - minRisk) / 3) {
      return 'w-5 h-5 -ml-2.5 -mt-2.5';
    } else {
      return 'w-6 h-6 -ml-3 -mt-3';
    }
  };

  const getRiskZoneStyle = (zone: string | null) => {
    if (!zone) return {};

    switch (zone) {
      case 'r1':
        return {
          background: 'rgba(254, 226, 226, 0.6)',
          left: 0,
          top: 0,
          width: '50%',
          height: '50%',
        };
      case 'r2':
        return {
          background: 'rgba(255, 237, 213, 0.6)',
          right: 0,
          top: 0,
          width: '50%',
          height: '50%',
        };
      case 'r3':
        return {
          background: 'rgba(254, 243, 199, 0.6)',
          left: 0,
          bottom: 0,
          width: '50%',
          height: '50%',
        };
      case 'r4':
        return {
          background: 'rgba(220, 252, 231, 0.6)',
          right: 0,
          bottom: 0,
          width: '50%',
          height: '50%',
        };
      default:
        return {};
    }
  };

  const getRiskButtonColor = (level: string) => {
    const colors = RISK_ZONE_COLORS[level as keyof typeof RISK_ZONE_COLORS];
    if (!colors)
      return 'bg-gray-light-200 text-gray-light-800 border-gray-light-300';
    return `${colors.bg} ${colors.text} ${colors.border}`;
  };

  const getRiskTitle = (level: string) => {
    switch (level) {
      case 'r1':
        return 'High Risk';
      case 'r2':
        return 'Medium-High Risk';
      case 'r3':
        return 'Medium-Low Risk';
      case 'r4':
        return 'Low Risk';
      default:
        return '';
    }
  };

  const getRiskDescription = (level: string) => {
    switch (level) {
      case 'r1':
        return 'High Importance, High Uncertainty assumptions can instantly fail your concept if proven invalid. Test them first.';
      case 'r2':
        return 'High Importance, Low Uncertainty assumptions are important but less risky. Confirm these after R1.';
      case 'r3':
        return 'Low Importance, High Uncertainty assumptions have moderate risk. Validate when resources permit.';
      case 'r4':
        return 'Low Importance, Low Uncertainty assumptions have minimal risk. Address these last, if at all.';
      default:
        return '';
    }
  };

  const getRiskIcon = (level: string) => {
    const colors = RISK_ZONE_COLORS[level as keyof typeof RISK_ZONE_COLORS];
    switch (level) {
      case 'r1':
        return (
          <Icon
            variant='alert-octagon'
            className={`h-4 w-4 ${colors?.icon || 'text-error-600'} mr-1.5`}
          />
        );
      case 'r2':
        return (
          <Icon
            variant='alert-circle'
            className={`h-4 w-4 ${colors?.icon || 'text-warning-600'} mr-1.5`}
          />
        );
      case 'r3':
        return (
          <Icon
            variant='alert-triangle'
            className={`h-4 w-4 ${colors?.icon || 'text-orange-600'} mr-1.5`}
          />
        );
      case 'r4':
        return (
          <Icon
            variant='check'
            className={`h-4 w-4 ${colors?.icon || 'text-success-600'} mr-1.5`}
          />
        );
      default:
        return <Icon variant='help-circle' className='mr-1.5 h-4 w-4' />;
    }
  };

  function getCategoryDotColor(category: string) {
    return (
      CATEGORY_COLORS[category as AssumptionCategory] ||
      'bg-indigo-500 hover:bg-indigo-600'
    );
  }

  return (
    <div
      className={cn(
        'aucctus-bg-secondary-extra-subtle aucctus-border-secondary flex h-full flex-col rounded-lg border p-4 shadow-sm md:col-span-4',
        className,
      )}
    >
      <div className='mb-2'>
        <h3 className='aucctus-text-primary mb-0.5 text-xl font-semibold'>
          Risk Matrix
        </h3>
        <p className='aucctus-text-sm aucctus-text-tertiary'>
          Visualize assumptions by risk level
        </p>
      </div>

      <div className='aucctus-border-secondary relative flex-grow rounded-md border bg-white'>
        <div className='absolute left-0 top-1/2 z-10 -translate-y-1/2'>
          <div className='-rotate-90 transform whitespace-nowrap rounded border border-gray-100 bg-white/80 px-2 py-1 text-xs font-medium shadow-sm'>
            Importance
          </div>
        </div>

        <div className='h-full w-full pb-4 pl-6 pr-2 pt-2'>
          <div className='relative h-full w-full'>
            <div className='absolute inset-0 grid grid-cols-8 grid-rows-8'>
              {Array(8)
                .fill(0)
                .map((_, rowIndex) =>
                  Array(8)
                    .fill(0)
                    .map((_, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className='border border-gray-100'
                      ></div>
                    )),
                )}
            </div>

            <div className='absolute left-0 right-0 top-1/2 z-[1] h-px bg-gray-300'></div>
            <div className='absolute bottom-0 left-1/2 top-0 z-[1] w-px bg-gray-300'></div>

            {activeRiskZone && (
              <div
                className='pointer-events-none absolute z-[2] transition-all duration-300'
                style={{
                  ...getRiskZoneStyle(activeRiskZone),
                  position: 'absolute',
                }}
              />
            )}

            {assumptions.map((assumption) => {
              const x = `${Math.min(100, Math.max(0, assumption.certainty))}%`;
              const y = `${Math.min(100, Math.max(0, 100 - assumption.importance))}%`;
              const dotSize = getDotSize(assumption.risk);

              return (
                <div
                  key={assumption.id}
                  className={`absolute ${dotSize} rounded-full ${getCategoryDotColor(assumption.category)} z-10 flex cursor-pointer items-center justify-center text-xs font-medium text-white shadow-md transition-transform hover:scale-110`}
                  style={{ left: x, top: y }}
                  onClick={() => setSelectedAssumption(assumption)}
                  title={assumption.statement}
                >
                  {assumption.id}
                </div>
              );
            })}
          </div>

          <div className='absolute bottom-0 left-1/2 z-10 -translate-x-1/2 rounded border border-gray-100 bg-white/80 px-2 py-1 text-xs font-medium shadow-sm'>
            Certainty
          </div>
        </div>
      </div>

      <div className='aucctus-border-secondary mt-2 rounded-md border bg-white p-0'>
        <div className='flex items-start space-x-0'>
          <div className='flex w-[50px] flex-col space-y-0'>
            {['r1', 'r2', 'r3', 'r4'].map((level) => (
              <ComponentTooltip key={level} tip={getRiskTitle(level)}>
                <button
                  onClick={() => setActiveRiskZone(level)}
                  className={`flex h-5 w-full items-center justify-center rounded-none border-b border-gray-200 text-[9px] font-semibold last:border-b-0 ${activeRiskZone === level ? getRiskButtonColor(level) : 'bg-gray-light-100 text-gray-light-600 hover:bg-gray-light-200'}`}
                >
                  {level.toUpperCase()}
                </button>
              </ComponentTooltip>
            ))}
          </div>

          <div className='min-h-[3.5rem] flex-1 pl-3'>
            {activeRiskZone ? (
              <div className='h-full px-2 py-2.5'>
                <div className='mb-1 flex items-center justify-between'>
                  <div className='flex items-center'>
                    {getRiskIcon(activeRiskZone)}
                    <h4 className='text-sm font-bold text-gray-800'>
                      {getRiskTitle(activeRiskZone)}
                    </h4>
                  </div>
                </div>
                <p className='text-xs leading-tight text-gray-600 opacity-80'>
                  {getRiskDescription(activeRiskZone)}
                </p>
              </div>
            ) : (
              <div className='flex h-full items-center justify-center text-gray-400'>
                <div className='flex items-center gap-1'>
                  <Icon variant='help-circle' className='h-3 w-3' />
                  <span className='text-2xs'>Select a risk level</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssumptionMatrixWidget;
