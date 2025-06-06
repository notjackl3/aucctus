import React from 'react';
import { Icon } from '@components';
import StatusBadge from '../badges/StatusBadge';
import RiskBadge from '../badges/RiskBadge';
import ImportanceMeter from '../badges/ImportanceMeter';
import CertaintyMeter from '../badges/CertaintyMeter';
import { getCategoryColors } from '../../constants/categoryColors';
import { IAssumptionV2 } from '@libs/api/types';

interface AssumptionDetailCardProps {
  assumption: IAssumptionV2;
  onClick?: () => void;
}

const AssumptionDetailCard: React.FC<AssumptionDetailCardProps> = ({
  assumption,
  onClick,
}) => {
  // Get category colors
  const categoryColors = getCategoryColors(assumption.category);

  // Convert 0-1 values to 0-100 percentages for display
  const riskPercentage = Math.round(assumption.risk * 100);
  const certaintyPercentage = Math.round(assumption.certainty * 100);
  const importancePercentage = Math.round(assumption.importance * 100);

  // Helper to get category icon
  const getCategoryIcon = (): React.ReactNode => {
    switch (assumption.category) {
      case 'desirability':
        return (
          <Icon
            variant='heart'
            className={`${categoryColors.stroke} h-5 w-5`}
          />
        );
      case 'viability':
        return (
          <Icon
            variant='currency-dollar'
            className={`${categoryColors.stroke} h-5 w-5`}
          />
        );
      case 'feasibility':
        return (
          <Icon variant='gear' className={`${categoryColors.stroke} h-5 w-5`} />
        );
      case 'adaptability':
        return (
          <Icon
            variant='refresh'
            className={`${categoryColors.stroke} h-5 w-5`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className='aucctus-bg-primary hover:aucctus-bg-primary-hover aucctus-border-secondary cursor-pointer rounded-lg border p-5 transition-colors'
      onClick={onClick}
    >
      {/* Assumption header */}
      <div className='mb-3 flex flex-wrap items-start justify-between gap-2'>
        <div className='flex items-center'>
          {getCategoryIcon()}
          <span className='aucctus-text-sm-medium ml-2 capitalize'>
            {assumption.category}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <RiskBadge risk={riskPercentage} />
          <StatusBadge status={assumption.status || 'untested'} />
        </div>
      </div>

      {/* Assumption statement */}
      <p className='aucctus-text-md-semibold aucctus-text-primary mb-4'>
        {assumption.statement}
      </p>

      {/* Meters */}
      <div className='mt-3 flex flex-wrap gap-2'>
        <ImportanceMeter importance={importancePercentage} />
        <CertaintyMeter certainty={certaintyPercentage} />
      </div>
    </div>
  );
};

export default AssumptionDetailCard;
