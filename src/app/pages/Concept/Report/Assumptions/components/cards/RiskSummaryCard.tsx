import React from 'react';
import {
  IAssumptionV2,
  CATEGORY_ICONS,
  getMeterValueColor,
  getMeterValueText,
  getMeterValueTextColor,
} from '@libs/api/types';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import RiskBadge from '../badges/RiskBadge';
import MeterSquares from '../../components/shared/MeterSquares';

interface RiskSummaryCardProps {
  assumptions: IAssumptionV2[];
  className?: string;
}

const RiskSummaryCard: React.FC<RiskSummaryCardProps> = ({
  assumptions,
  className = '',
}) => {
  // Filter for high-risk assumptions (those with high importance and low certainty)
  const highRiskAssumptions = assumptions
    .filter((a) => a.importance > 75 && a.certainty < 50)
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 3); // Get top 3 highest risk assumptions

  // Get one from each category if possible, prioritizing desirability and feasibility
  const desirabilityAssumption = assumptions
    .filter((a) => a.category === 'desirability')
    .sort(
      (a, b) =>
        b.importance * (100 - b.certainty) - a.importance * (100 - a.certainty),
    )
    .slice(0, 1);

  const feasibilityAssumption = assumptions
    .filter((a) => a.category === 'feasibility')
    .sort(
      (a, b) =>
        b.importance * (100 - b.certainty) - a.importance * (100 - a.certainty),
    )
    .slice(0, 1);

  // If we have both types, use them; otherwise fall back to highest risk ones
  const displayAssumptions =
    desirabilityAssumption.length > 0 && feasibilityAssumption.length > 0
      ? [...desirabilityAssumption, ...feasibilityAssumption]
      : highRiskAssumptions.length >= 2
        ? highRiskAssumptions
        : assumptions
            .sort(
              (a, b) =>
                b.importance * (100 - b.certainty) -
                a.importance * (100 - a.certainty),
            )
            .slice(0, 2);

  return (
    <div
      className={cn(
        'aucctus-bg-primary flex h-full flex-col rounded-lg p-6',
        className,
      )}
    >
      <div className='mb-2'>
        <h3 className='aucctus-text-primary mb-0.5 text-xl font-semibold'>
          Your Biggest Risks
        </h3>
        <p className='aucctus-text-sm aucctus-text-tertiary'>
          These are the assumptions you should test next.
        </p>
      </div>

      <div className='mt-4 flex-grow space-y-4'>
        {displayAssumptions.length > 0 ? (
          displayAssumptions.map((assumption) => (
            <div
              key={assumption.id}
              className='aucctus-border-tertiary rounded-lg border p-4 transition-colors hover:border-gray-200'
            >
              <div className='mb-3 flex items-start justify-between'>
                <div className='flex items-center gap-2'>
                  <div
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full',
                      CATEGORY_ICONS[assumption.category].bgClass,
                    )}
                  >
                    <Icon
                      variant={CATEGORY_ICONS[assumption.category].iconVariant}
                      className={cn(
                        'h-4 w-4',
                        CATEGORY_ICONS[assumption.category].iconClass,
                      )}
                    />
                  </div>
                  <span className='aucctus-text-sm-medium capitalize'>
                    {assumption.category}
                  </span>
                </div>
                <RiskBadge risk={assumption.risk} />
              </div>

              <p className='aucctus-text-md aucctus-text-primary my-3 leading-tight'>
                {assumption.statement}
              </p>

              <div className='mt-4 flex flex-wrap gap-3 text-xs'>
                {/* Certainty meter */}
                <div className='aucctus-bg-secondary-subtle aucctus-border-tertiary inline-block rounded p-2'>
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center'>
                      <Icon
                        variant='signal-02'
                        className='aucctus-stroke-tertiary mr-1.5 h-3.5 w-3.5'
                      />
                      <span className='aucctus-text-sm-medium aucctus-text-primary'>
                        Certainty
                      </span>
                    </div>
                    <div className='flex items-center space-x-1.5'>
                      <MeterSquares
                        value={assumption.certainty}
                        blockColors={[getMeterValueColor(assumption.certainty)]}
                      />
                      <span
                        className={cn(
                          'aucctus-text-sm-medium',
                          getMeterValueTextColor(assumption.certainty),
                        )}
                      >
                        {getMeterValueText(assumption.certainty)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Importance meter */}
                <div className='aucctus-bg-secondary-subtle aucctus-border-tertiary inline-block rounded p-2'>
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center'>
                      <Icon
                        variant='currency-dollar'
                        className='aucctus-stroke-tertiary mr-1.5 h-3.5 w-3.5'
                      />
                      <span className='aucctus-text-sm-medium aucctus-text-primary'>
                        Importance
                      </span>
                    </div>
                    <div className='flex items-center space-x-1.5'>
                      <MeterSquares
                        value={assumption.importance}
                        blockColors={[
                          getMeterValueColor(assumption.importance),
                        ]}
                      />
                      <span
                        className={cn(
                          'aucctus-text-sm-medium',
                          getMeterValueTextColor(assumption.importance, true),
                        )}
                      >
                        {getMeterValueText(assumption.importance)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className='aucctus-text-tertiary py-8 text-center'>
            No high-risk assumptions found
          </p>
        )}
      </div>

      {displayAssumptions.length > 0 && (
        <div className='mt-auto pt-6 text-right'>
          <button className='btn btn-primary flex items-center justify-center px-4 py-2 text-sm'>
            <span>View Recommended Tests</span>
            <Icon
              variant='arrowright'
              className='aucctus-stroke-white ml-2 h-4 w-4'
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default RiskSummaryCard;
