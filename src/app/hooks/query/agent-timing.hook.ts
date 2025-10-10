import { useQuery } from 'react-query';
import api from '@libs/api';
import { AucctusQueryKeys } from './query-keys';

/**
 * Hook to get estimated execution time for an agent.
 *
 * Returns the average execution time based on historical data from the last N runs.
 * If conceptUuid is provided, returns concept-specific timing if available,
 * otherwise falls back to global timing across all concepts.
 *
 * @param agentName - Unique identifier for the agent type (e.g., 'SyntheticInterviewAgent')
 * @param conceptUuid - Optional concept UUID for concept-specific timing
 * @param options - Optional React Query options
 */
export const useAgentEstimatedTime = (
  agentName: string,
  conceptUuid?: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  },
) => {
  const isEnabled = !!agentName && options?.enabled !== false;
  return useQuery({
    queryKey: [AucctusQueryKeys.agentTiming, agentName, conceptUuid],
    queryFn: async () => {
      if (!agentName) return null;
      return await api.concept.getAgentEstimatedTime(agentName, conceptUuid);
    },
    enabled: isEnabled,
    staleTime: options?.staleTime || 1000 * 60 * 5, // 5 minutes default
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    onError: () => {
      // Silent fail - timing is non-critical
    },
  });
};

/**
 * Hook to get estimated execution time for the complete synthetic interview pipeline.
 *
 * Calculates the total time for all agents involved in the synthetic testing process:
 * - InterviewerScriptAgent (1x)
 * - SyntheticInterviewAgent (numProfiles×)
 * - LearningsAgent (numProfiles×)
 * - ImpactAnalysisAgent (numProfiles×)
 * - FindingsExtractionAgent (1x)
 *
 * @param conceptUuid - Concept UUID for concept-specific timing
 * @param numProfiles - Number of customer profiles being tested
 * @param options - Optional React Query options
 */
export const useSyntheticPipelineEstimate = (
  conceptUuid: string,
  numProfiles: number,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  },
) => {
  const isEnabled =
    !!conceptUuid && numProfiles > 0 && options?.enabled !== false;

  return useQuery({
    queryKey: [
      AucctusQueryKeys.syntheticPipelineEstimate,
      conceptUuid,
      numProfiles,
    ],
    queryFn: async () => {
      return await api.concept.getSyntheticPipelineEstimate(
        conceptUuid,
        numProfiles,
      );
    },
    enabled: isEnabled,
    staleTime: options?.staleTime || 1000 * 60 * 5, // 5 minutes default
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    onError: () => {
      // Silent fail - timing is non-critical
    },
  });
};
