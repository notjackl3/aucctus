import React, { useEffect, useRef, useState } from 'react';
import {
  IImpactSizingAssumptionEntryV2,
  IImpactSizingV2,
} from '@libs/api/types/concept/financialProjectionV2';
import { CalculatorHeader } from './components/CalculatorHeader';
import { AssumptionsPanel } from './components/AssumptionsPanel';
import { ResultsPanel } from './components/ResultsPanel';

export interface BaseCalculatorProps {
  impactSizing: IImpactSizingV2;
}

interface CalculatorLayoutProps extends BaseCalculatorProps {
  impactSizing: IImpactSizingV2;
  title: string;
  description: string;
  assumptionsTitle: string;
  resultsTitle: string;
  resultsSubtitle: string;
  resultValueTitle: string;
  resultValueDescription: string;
}

export const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({
  impactSizing,
  title,
  description,
  assumptionsTitle,
  resultsTitle,
  resultsSubtitle,
  resultValueTitle,
  resultValueDescription,
}) => {
  const [assumptions, setAssumptions] = useState<
    IImpactSizingAssumptionEntryV2[]
  >(impactSizing.assumptionEntries);

  const handleAssumptionChange = (uuid: string, value: number) => {
    const updatedAssumptions = assumptions.map((assumption) =>
      assumption.uuid === uuid ? { ...assumption, scalar: value } : assumption,
    );
    setAssumptions(updatedAssumptions);
  };

  const resetToDefaults = () => {
    setAssumptions(impactSizing.assumptionEntries);
  };

  const assumptionsRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncHeight = () => {
      if (assumptionsRef.current && resultsRef.current) {
        const resultsHeight = resultsRef.current.offsetHeight;
        assumptionsRef.current.style.maxHeight = `${resultsHeight}px`;
        assumptionsRef.current.style.overflowY = 'auto';
      }
    };

    // Run once after initial render
    syncHeight();

    // Also sync on window resize
    window.addEventListener('resize', syncHeight);

    // Create a ResizeObserver to detect changes in the visualization height
    const resizeObserver = new ResizeObserver(() => syncHeight());

    if (resultsRef.current) {
      resizeObserver.observe(resultsRef.current);
    }

    return () => {
      window.removeEventListener('resize', syncHeight);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className='space-y-4'>
      <CalculatorHeader title={title} description={description} />

      <div className='aucctus-bg-primary overflow-hidden rounded-lg border shadow-sm'>
        <div className='grid grid-cols-1 divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0'>
          {/* Left side: Assumptions List */}
          <AssumptionsPanel
            assumptions={assumptions}
            assumptionsTitle={assumptionsTitle}
            onAssumptionChange={handleAssumptionChange}
            resetToDefaults={resetToDefaults}
            assumptionsRef={assumptionsRef}
          />

          {/* Right side: Results */}
          <ResultsPanel
            resultsTitle={resultsTitle}
            resultsSubtitle={resultsSubtitle}
            resultValueTitle={resultValueTitle}
            resultValueDescription={resultValueDescription}
            assumptions={assumptions}
            resultsRef={resultsRef}
          />
        </div>
      </div>
    </div>
  );
};
