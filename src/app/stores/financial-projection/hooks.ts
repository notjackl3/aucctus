import { useState, useEffect, useCallback } from 'react';
import {
  IMarketSizingAssumptionEntryV2,
  IImpactSizingAssumptionEntryV2,
} from '@libs/api/types';
import useStore from '@stores/store';

// Hook for managing market sizing assumptions with persistence
export const useMarketSizingAssumptions = (
  marketSizingUuid?: string,
  initialAssumptions?: IMarketSizingAssumptionEntryV2[],
) => {
  const [assumptions, setAssumptions] = useState<
    IMarketSizingAssumptionEntryV2[]
  >([]);

  const {
    marketSizingAssumptions,
    setMarketSizingAssumptions,
    resetMarketSizingAssumptions,
  } = useStore((state) => state.financialProjection);

  // Initialize assumptions from persisted data or API data
  useEffect(() => {
    if (!marketSizingUuid) return;

    // Check if we have persisted assumptions for this market sizing
    const persistedAssumptions = marketSizingAssumptions[marketSizingUuid];

    if (persistedAssumptions && persistedAssumptions.length > 0) {
      // Use persisted assumptions
      setAssumptions(persistedAssumptions);
    } else if (initialAssumptions && initialAssumptions.length > 0) {
      // Use API data as fallback
      setAssumptions(initialAssumptions);
    }
  }, [marketSizingUuid, initialAssumptions, marketSizingAssumptions]);

  const updateAssumption = useCallback(
    (uuid: string, value: number) => {
      const updatedAssumptions = assumptions.map((assumption) =>
        assumption.uuid === uuid
          ? { ...assumption, scalar: value }
          : assumption,
      );
      setAssumptions(updatedAssumptions);

      // Persist updated assumptions to store
      if (marketSizingUuid) {
        setMarketSizingAssumptions(marketSizingUuid, updatedAssumptions);
      }
    },
    [assumptions, marketSizingUuid, setMarketSizingAssumptions],
  );

  const resetToDefaults = useCallback(() => {
    if (initialAssumptions && marketSizingUuid) {
      setAssumptions(initialAssumptions);
      // Clear persisted assumptions to reset to API defaults
      resetMarketSizingAssumptions(marketSizingUuid);
    }
  }, [initialAssumptions, marketSizingUuid, resetMarketSizingAssumptions]);

  return {
    assumptions,
    updateAssumption,
    resetToDefaults,
  };
};

// Hook for managing impact sizing assumptions with persistence
export const useImpactSizingAssumptions = (
  impactSizingUuid?: string,
  initialAssumptions?: IImpactSizingAssumptionEntryV2[],
) => {
  const [assumptions, setAssumptions] = useState<
    IImpactSizingAssumptionEntryV2[]
  >([]);

  const {
    impactSizingAssumptions,
    setImpactSizingAssumptions,
    resetImpactSizingAssumptions,
  } = useStore((state) => state.financialProjection);

  // Initialize assumptions from persisted data or API data
  useEffect(() => {
    if (!impactSizingUuid) return;

    // Check if we have persisted assumptions for this impact sizing
    const persistedAssumptions = impactSizingAssumptions[impactSizingUuid];

    if (persistedAssumptions && persistedAssumptions.length > 0) {
      // Use persisted assumptions
      setAssumptions(persistedAssumptions);
    } else if (initialAssumptions && initialAssumptions.length > 0) {
      // Use API data as fallback
      setAssumptions(initialAssumptions);
    }
  }, [impactSizingUuid, initialAssumptions, impactSizingAssumptions]);

  const updateAssumption = useCallback(
    (uuid: string, value: number) => {
      const updatedAssumptions = assumptions.map((assumption) =>
        assumption.uuid === uuid
          ? { ...assumption, scalar: value }
          : assumption,
      );
      setAssumptions(updatedAssumptions);

      // Persist updated assumptions to store
      if (impactSizingUuid) {
        setImpactSizingAssumptions(impactSizingUuid, updatedAssumptions);
      }
    },
    [assumptions, impactSizingUuid, setImpactSizingAssumptions],
  );

  const resetToDefaults = useCallback(() => {
    if (initialAssumptions && impactSizingUuid) {
      setAssumptions(initialAssumptions);
      // Clear persisted assumptions to reset to API defaults
      resetImpactSizingAssumptions(impactSizingUuid);
    }
  }, [initialAssumptions, impactSizingUuid, resetImpactSizingAssumptions]);

  return {
    assumptions,
    updateAssumption,
    resetToDefaults,
  };
};
