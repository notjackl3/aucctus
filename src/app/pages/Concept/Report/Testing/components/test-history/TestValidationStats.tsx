import React from 'react';

interface ValidationStats {
  validated: number;
  invalidated: number;
}

interface TestValidationStatsProps {
  validationStats: ValidationStats;
}

const TestValidationStats: React.FC<TestValidationStatsProps> = ({
  validationStats,
}) => {
  return (
    <div className='grid grid-cols-2 gap-2'>
      <div className='rounded-md bg-green-50 p-3 text-center'>
        <div className='text-xl font-semibold text-green-700'>
          {validationStats.validated}
        </div>
        <div className='text-xs text-green-600'>Validated</div>
      </div>
      <div className='rounded-md bg-red-50 p-3 text-center'>
        <div className='text-xl font-semibold text-red-700'>
          {validationStats.invalidated}
        </div>
        <div className='text-xs text-red-600'>Invalidated</div>
      </div>
    </div>
  );
};

export default TestValidationStats;
