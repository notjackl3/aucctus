import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '@components';
import {
  IMarketSizingV2,
  IMarketSizingAssumptionEntryV2,
} from '@libs/api/types';
import { getAssumptionsByGroup, updateAssumption } from './assumptionsUtils';
import AssumptionsList from './AssumptionsList';
import MarketSizeVisualization from './MarketSizeVisualization';
import useStore from '@stores/store';

interface SimpleMarketSizeViewProps {
  marketSizing?: IMarketSizingV2;
}

const SimpleMarketSizeView: React.FC<SimpleMarketSizeViewProps> = ({
  marketSizing,
}) => {
  const [activeFilter, setActiveFilter] = useState<
    'tam' | 'sam' | 'som' | undefined
  >(undefined);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [assumptions, setAssumptions] = useState<
    IMarketSizingAssumptionEntryV2[]
  >([]);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const assumptionsListRef = useRef<HTMLDivElement>(null);

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

  // Sync height between visualization and assumptions list
  useEffect(() => {
    const syncHeight = () => {
      if (visualizationRef.current && assumptionsListRef.current) {
        const visHeight = visualizationRef.current.offsetHeight;
        assumptionsListRef.current.style.maxHeight = `${visHeight}px`;
        assumptionsListRef.current.style.overflowY = 'auto';
      }
    };

    // Run once after initial render
    syncHeight();

    // Also sync on window resize
    window.addEventListener('resize', syncHeight);

    // Create a ResizeObserver to detect changes in the visualization height
    const resizeObserver = new ResizeObserver(() => syncHeight());

    if (visualizationRef.current) {
      resizeObserver.observe(visualizationRef.current);
    }

    return () => {
      window.removeEventListener('resize', syncHeight);
      resizeObserver.disconnect();
    };
  }, []);

  // Update isFilterActive when activeFilter changes
  useEffect(() => {
    setIsFilterActive(activeFilter !== undefined);
  }, [activeFilter]);

  // Reset to original values from API data
  const resetToDefaults = () => {
    if (marketSizing?.assumptionEntries && marketSizing?.uuid) {
      setAssumptions(marketSizing.assumptionEntries);
      // Clear persisted assumptions to reset to API defaults
      resetMarketSizingAssumptions(marketSizing.uuid);
    }
    setActiveFilter(undefined);
  };

  // Handle assumption value change
  const handleAssumptionChange = useCallback(
    (id: string, newValue: number) => {
      setAssumptions((currentAssumptions) => {
        const { updatedAssumptions } = updateAssumption(
          currentAssumptions,
          id,
          newValue,
        );

        // Persist updated assumptions to store
        if (marketSizing?.uuid) {
          setMarketSizingAssumptions(marketSizing.uuid, updatedAssumptions);
        }

        return updatedAssumptions;
      });
    },
    [marketSizing?.uuid, setMarketSizingAssumptions],
  );

  // Toggle filter on/off
  const handleFilterToggle = (filter: 'tam' | 'sam' | 'som') => {
    if (activeFilter === filter) {
      setActiveFilter(undefined);
    } else {
      setActiveFilter(filter);
    }
  };

  // Get filtered assumptions
  const getFilteredAssumptions = () => {
    if (!activeFilter) return assumptions;
    return getAssumptionsByGroup(assumptions, activeFilter);
  };

  // Don't render if no market sizing data
  if (
    !marketSizing?.assumptionEntries ||
    marketSizing.assumptionEntries.length === 0
  ) {
    return (
      <div className='aucctus-bg-secondary-subtle aucctus-border-primary rounded-lg border p-4'>
        <div className='flex items-start gap-3'>
          <Icon
            variant='alert-circle'
            className='aucctus-stroke-tertiary h-6 w-6 self-center justify-self-center'
          />
          <div>
            <h3 className='aucctus-text-md-semibold aucctus-text-primary mb-1'>
              No Market Sizing Data Available
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='aucctus-bg-primary overflow-hidden rounded-lg border shadow-sm'>
        <div className='grid grid-cols-1 divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0'>
          {/* Left side: Assumptions List */}
          <div className='overflow-hidden'>
            <AssumptionsList
              ref={assumptionsListRef}
              bodyClassName='p-6'
              activeFilter={activeFilter}
              isFilterActive={isFilterActive}
              filteredAssumptions={getFilteredAssumptions()}
              marketSizing={marketSizing}
              resetToDefaults={resetToDefaults}
              handleAssumptionChange={handleAssumptionChange}
            />
          </div>

          {/* Right side: Market Size Visualization */}
          <MarketSizeVisualization
            ref={visualizationRef}
            className='aspect-square space-y-4 p-6'
            activeFilter={activeFilter}
            handleFilterToggle={handleFilterToggle}
            assumptions={assumptions}
          />
        </div>
      </div>
    </div>
  );
};

export default SimpleMarketSizeView;
