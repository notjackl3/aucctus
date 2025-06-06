import React from 'react';
import { Icon } from '@components';
import StatusBadge from '../badges/StatusBadge';
import RiskBadge from '../badges/RiskBadge';
import ImportanceMeter from '../badges/ImportanceMeter';
import CertaintyMeter from '../badges/CertaintyMeter';
import ValidationBenchmarkCard from '../../../Testing/components/modal-sections/test-impact/components/ValidationBenchmarkCard';
import { getCategoryColors } from '../../constants/categoryColors';
import { getCategoryIcon } from '../../utils/assumptionUtils';
import { IAssumptionV2 } from '@libs/api/types';

interface AssumptionDetailCardProps {
  assumption: IAssumptionV2;
  onClick?: () => void;
  showBenchmark?: boolean;
}

const AssumptionDetailCard: React.FC<AssumptionDetailCardProps> = ({
  assumption,
  onClick,
  showBenchmark,
}) => {
  // Get category colors
  const categoryColors = getCategoryColors(assumption.category);

  // Convert 0-1 values to 0-100 percentages for display
  const riskPercentage = Math.round(assumption.risk * 100);
  const certaintyPercentage = Math.round(assumption.certainty * 100);
  const importancePercentage = Math.round(assumption.importance * 100);

  // Helper to render category icon using utility function
  const renderCategoryIcon = (): React.ReactNode => {
    const iconVariant = getCategoryIcon(assumption.category);
    return (
      <Icon
        variant={iconVariant as any}
        className={`${categoryColors.stroke} h-5 w-5`}
      />
    );
  };
  return (
    <div
      className='aucctus-bg-primary hover:aucctus-bg-primary-hover aucctus-border-secondary cursor-pointer rounded-lg border p-5 transition-colors'
      onClick={onClick}
    >
      {/* Assumption header */}
      <div className='mb-3 flex flex-wrap items-start justify-between gap-2'>
        <div className='flex items-center'>
          {renderCategoryIcon()}
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
      <div className='mb-4 mt-3 flex flex-wrap gap-2'>
        <ImportanceMeter importance={importancePercentage} />
        <CertaintyMeter certainty={certaintyPercentage} />
      </div>

      {showBenchmark && assumption.benchmark && (
        <ValidationBenchmarkCard benchmark={assumption.benchmark} />
      )}
    </div>
  );
};

export default AssumptionDetailCard;
