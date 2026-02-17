import React from 'react';
import { IAssumptionV2, AssumptionCategory } from '@libs/api/types';
import CategoryIcon from '../../../Assumptions/components/cards/category-progress-card/CategoryIcon';
import { AlertTriangle } from 'lucide-react';
interface TestAssumptionsDisplayProps {
  mappedAssumptions: IAssumptionV2[];
}

// Result badge component
const AssumptionResultBadge: React.FC<{
  result: 'validated' | 'invalidated' | null;
}> = ({ result }) => {
  if (result === 'validated') {
    return (
      <span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800'>
        Validated
      </span>
    );
  }
  if (result === 'invalidated') {
    return (
      <span className='inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800'>
        Invalidated
      </span>
    );
  }
  return (
    <span className='inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800'>
      Untested
    </span>
  );
};

// Risk level tag component
const RiskLevelTag: React.FC<{ risk: number }> = ({ risk }) => {
  const getRiskLabel = () => {
    if (risk > 66) return 'High';
    if (risk > 33) return 'Medium';
    return 'Low';
  };

  const getRiskColor = () => {
    if (risk > 66) return 'bg-red-100 text-red-700 border-red-200';
    if (risk > 33) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getStrokeColor = () => {
    if (risk > 66) return 'stroke-red-700';
    if (risk > 33) return 'stroke-yellow-700';
    return 'stroke-green-700';
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded border p-2 ${getRiskColor()}`}
    >
      <AlertTriangle className={`h-3.5 w-3.5 ${getStrokeColor()}`} />
      <span className='text-xs font-medium'>Risk:</span>
      <span className='text-xs'>{getRiskLabel()}</span>
    </div>
  );
};

// Meter indicator component (3 bars) - matching EditableCertaintyMeter/EditableImportanceMeter
const MeterIndicator: React.FC<{
  label: string;
  value: number;
}> = ({ label, value }) => {
  // Determine level based on value (0-100)
  const getLevel = (): 'low' | 'medium' | 'high' => {
    if (value >= 75) return 'high';
    if (value >= 50) return 'medium';
    return 'low';
  };

  const level = getLevel();

  // Color scheme matching EditableCertaintyMeter/EditableImportanceMeter
  // High = red, Medium = yellow, Low = green
  const getBlockColor = () => {
    switch (level) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
    }
  };

  const getBlockCount = () => {
    switch (level) {
      case 'high':
        return 3;
      case 'medium':
        return 2;
      case 'low':
        return 1;
    }
  };

  const blockColor = getBlockColor();
  const blockCount = getBlockCount();

  return (
    <div className='inline-flex items-center gap-2 rounded border border-gray-100 bg-gray-50 p-2'>
      <span className='text-xs font-medium text-gray-700'>{label}:</span>
      <div className='flex gap-0.5'>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-2.5 w-1.5 ${i < blockCount ? blockColor : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <span className='text-xs capitalize'>{level}</span>
    </div>
  );
};

// Single assumption card matching lovable design
const AssumptionCard: React.FC<{
  assumption: IAssumptionV2;
}> = ({ assumption }) => {
  // Determine result from status
  const getResult = (): 'validated' | 'invalidated' | null => {
    const status = assumption.validationStatus || assumption.status;
    if (status === 'validated') return 'validated';
    if (status === 'invalidated') return 'invalidated';
    return null;
  };

  // Convert 0-1 values to percentages for display
  const certaintyValue = Math.round((assumption.certainty || 0.5) * 100);
  const importanceValue = Math.round((assumption.importance || 0.7) * 100);
  const riskValue = Math.round((assumption.risk || 0.5) * 100);

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary overflow-hidden rounded-lg border shadow-sm'>
      <div className='p-4'>
        {/* Header - Category icon + label on left, result badge on right */}
        <div className='mb-2 flex items-start justify-between'>
          <div className='flex items-center space-x-2'>
            <CategoryIcon
              category={assumption.category as AssumptionCategory}
            />
            <span className='aucctus-text-sm-medium capitalize'>
              {assumption.category}
            </span>
          </div>
          <AssumptionResultBadge result={getResult()} />
        </div>

        {/* Statement */}
        <p className='aucctus-text-md-medium aucctus-text-primary mb-2'>
          {assumption.statement}
        </p>

        {/* Details - Risk, Certainty, Importance */}
        <div className='mt-2 flex flex-wrap gap-3'>
          <RiskLevelTag risk={riskValue} />
          <MeterIndicator label='Certainty' value={certaintyValue} />
          <MeterIndicator label='Importance' value={importanceValue} />
        </div>
      </div>
    </div>
  );
};

const TestAssumptionsDisplay: React.FC<TestAssumptionsDisplayProps> = ({
  mappedAssumptions,
}) => {
  return (
    <div className='space-y-3'>
      {mappedAssumptions.map((assumption) => (
        <AssumptionCard key={assumption.id} assumption={assumption} />
      ))}
    </div>
  );
};

export default TestAssumptionsDisplay;
