import React, { useEffect, useRef, useState } from 'react';
import {
  IImpactSizingAssumptionEntryV2,
  IImpactSizingV2,
} from '@libs/api/types/concept/financialProjectionV2';
import { CalculatorHeader } from './components/CalculatorHeader';
import { AssumptionsPanel } from './components/AssumptionsPanel';
import { ResultsPanel } from './components/ResultsPanel';
import useStore from '@stores/store';

export interface BaseCalculatorProps {
  impactSizing: IImpactSizingV2;
}

interface CalculatorLayoutProps extends BaseCalculatorProps {
  impactSizing: IImpactSizingV2;
  title: string;
  description: string;
  resultsTitle: string;
  resultValueTitle: string;
  resultValueDescription: string;
}

export const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({
  impactSizing,
  title,
  description,
  resultsTitle,
  resultValueTitle,
  resultValueDescription,
}) => {
  const [assumptions, setAssumptions] = useState<
    IImpactSizingAssumptionEntryV2[]
  >([]);

  // Store actions for persisting assumptions
  const {
    impactSizingAssumptions,
    setImpactSizingAssumptions,
    resetImpactSizingAssumptions,
  } = useStore((state) => state.financialProjection);

  // Initialize assumptions from persisted data or API data
  useEffect(() => {
    if (!impactSizing?.uuid) return;

    // Check if we have persisted assumptions for this impact sizing
    const persistedAssumptions = impactSizingAssumptions[impactSizing.uuid];

    if (persistedAssumptions && persistedAssumptions.length > 0) {
      // Use persisted assumptions
      setAssumptions(persistedAssumptions);
    } else if (
      impactSizing?.assumptionEntries &&
      impactSizing.assumptionEntries.length > 0
    ) {
      // Use API data as fallback
      setAssumptions(impactSizing.assumptionEntries);
    }
  }, [impactSizing, impactSizingAssumptions]);

  const handleAssumptionChange = (uuid: string, value: number) => {
    const updatedAssumptions = assumptions.map((assumption) =>
      assumption.uuid === uuid ? { ...assumption, scalar: value } : assumption,
    );
    setAssumptions(updatedAssumptions);

    // Persist updated assumptions to store
    if (impactSizing?.uuid) {
      setImpactSizingAssumptions(impactSizing.uuid, updatedAssumptions);
    }
  };

  const resetToDefaults = () => {
    if (impactSizing?.assumptionEntries && impactSizing?.uuid) {
      setAssumptions(impactSizing.assumptionEntries);
      // Clear persisted assumptions to reset to API defaults
      resetImpactSizingAssumptions(impactSizing.uuid);
    }
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
            originalAssumptions={impactSizing.assumptionEntries}
            onAssumptionChange={handleAssumptionChange}
            resetToDefaults={resetToDefaults}
            assumptionsRef={assumptionsRef}
          />

          {/* Right side: Results */}
          <ResultsPanel
            resultsTitle={resultsTitle}
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
