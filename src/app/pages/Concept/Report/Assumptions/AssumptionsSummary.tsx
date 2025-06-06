import React from 'react';
import { IAssumptionV2 } from '@libs/api/types';
// Only import cn if it's being used
// import { cn } from '../../../../utils/cn';
import AssumptionMatrixWidget from './components/widgets/AssumptionMatrixWidget';
import ConceptConfidenceWidget from './components/widgets/ConceptConfidenceWidget';
import RiskSummaryCard from './components/cards/RiskSummaryCard';

interface AssumptionsSummaryProps {
  assumptions: IAssumptionV2[];
  selectedAssumption: IAssumptionV2 | null;
  setSelectedAssumption: (assumption: IAssumptionV2 | null) => void;
  calculateConfidenceScore: () => number;
}

const AssumptionsSummary: React.FC<AssumptionsSummaryProps> = ({
  assumptions,
  // Remove unused parameter or use it
  // selectedAssumption,
  setSelectedAssumption,
  calculateConfidenceScore,
}) => {
  return (
    <>
      <div className='mb-10 flex flex-col gap-6 md:flex-row'>
        <div className='aucctus-bg-primary flex-1 overflow-hidden rounded-lg shadow-sm'>
          <ConceptConfidenceWidget
            assumptions={assumptions}
            calculateConfidenceScore={calculateConfidenceScore}
            className='h-full w-full'
          />
        </div>

        <div className='aucctus-bg-primary flex-1 overflow-hidden rounded-lg shadow-sm'>
          <AssumptionMatrixWidget
            assumptions={assumptions}
            setSelectedAssumption={setSelectedAssumption}
            className='h-full w-full'
          />
        </div>

        <div className='aucctus-bg-primary flex-1 overflow-hidden rounded-lg shadow-sm'>
          <RiskSummaryCard
            assumptions={assumptions}
            className='h-full w-full'
          />
        </div>
      </div>
    </>
  );
};

export default AssumptionsSummary;
