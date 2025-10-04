import React, { useEffect, useRef, useState } from 'react';
import {
  IMarketSizingAssumptionEntryV2,
  IMarketSizingV2,
} from '@libs/api/types/concept/financialProjectionV2';
import { AssumptionsPanel } from './components/AssumptionsPanel';
import { ResultsPanel } from './components/ResultsPanel';
import useStore from '@stores/store';

export interface BaseCalculatorProps {
  marketSizing: IMarketSizingV2;
}

interface CalculatorLayoutProps extends BaseCalculatorProps {
  marketSizing: IMarketSizingV2;
  title?: string;
  description?: string;
  assumptionsTitle: string;
  resultsTitle: string;
  resultsSubtitle: string;
  resultValueTitle: string;
  resultValueDescription: string;
}

export const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({
  marketSizing,
  // title and description are reserved for future use
  assumptionsTitle,
  resultsTitle,
  resultsSubtitle,
  resultValueTitle,
  resultValueDescription,
}) => {
  const [assumptions, setAssumptions] = useState<
    IMarketSizingAssumptionEntryV2[]
  >([]);

  // Store actions for persisting assumptions
  const {
    marketSizingAssumptions,
    setMarketSizingAssumptions,
    resetMarketSizingAssumptions,
  } = useStore((state) => state.financialProjection);

  // Initialize assumptions from persisted data or API data
  useEffect(() => {
    if (!marketSizing?.uuid) return;

    // Check if we have persisted assumptions for this market sizing
    const persistedAssumptions = marketSizingAssumptions[marketSizing.uuid];

    if (persistedAssumptions && persistedAssumptions.length > 0) {
      // Use persisted assumptions
      setAssumptions(persistedAssumptions);
    } else if (
      marketSizing?.assumptionEntries &&
      marketSizing.assumptionEntries.length > 0
    ) {
      // Use API data as fallback
      setAssumptions(marketSizing.assumptionEntries);
    }
  }, [marketSizing, marketSizingAssumptions]);

  const handleAssumptionChange = (uuid: string, value: number) => {
    const updatedAssumptions = assumptions.map((assumption) =>
      assumption.uuid === uuid ? { ...assumption, scalar: value } : assumption,
    );
    setAssumptions(updatedAssumptions);

    // Persist updated assumptions to store
    if (marketSizing?.uuid) {
      setMarketSizingAssumptions(marketSizing.uuid, updatedAssumptions);
    }
  };

  const resetToDefaults = () => {
    if (marketSizing?.assumptionEntries && marketSizing?.uuid) {
      setAssumptions(marketSizing.assumptionEntries);
      // Clear persisted assumptions to reset to API defaults
      resetMarketSizingAssumptions(marketSizing.uuid);
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
      <div className='aucctus-bg-primary overflow-hidden rounded-lg border shadow-sm'>
        <div className='grid grid-cols-1 divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0'>
          {/* Left side: Assumptions List */}
          <AssumptionsPanel
            assumptions={assumptions}
            originalAssumptions={marketSizing.assumptionEntries}
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
