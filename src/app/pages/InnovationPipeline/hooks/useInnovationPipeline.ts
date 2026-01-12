import { useMemo, useCallback, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import type { DragEndEvent } from '@dnd-kit/core';
import { useConcepts } from '@hooks/query/concepts.hook';
import api from '@libs/api';
import type { ConceptStatus, IConcept } from '@libs/api/types';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import { toast } from '@components';
import {
  PIPELINE_STAGES,
  STAGE_TO_TARGET_STATUS,
  type ConceptsByStage,
  type PipelineStage,
} from '../types/pipeline.types';

export interface PipelineFilterOptions {
  search?: string;
}

export const useInnovationPipeline = () => {
  const queryClient = useQueryClient();
  const [filterOptions, setFilterOptions] = useState<PipelineFilterOptions>({});

  // Fetch all active concepts (excluding 'new' and 'archived')
  // Use pageSize: 200 to fetch more concepts for the kanban view
  const { data, isLoading, refetch } = useConcepts({
    category: 'active',
    status:
      'ideating,inReview,prototyping,proofOfConcept,minimumViableProduct,commercialized',
    pageSize: 199,
    search: filterOptions.search || undefined,
  });

  // Update filter options
  const updateFilterOptions = useCallback(
    (updates: Partial<PipelineFilterOptions>) => {
      setFilterOptions((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  // Group concepts by pipeline stage
  const conceptsByStage = useMemo<ConceptsByStage>(() => {
    const groups: ConceptsByStage = {
      discovery: [],
      prototyping: [],
      proofOfConcept: [],
      mvp: [],
      scaling: [],
    };

    data?.results?.forEach((concept) => {
      const stage = PIPELINE_STAGES.find((s) =>
        s.statusList.includes(concept.status),
      );
      if (stage) {
        groups[stage.key].push(concept);
      }
    });

    return groups;
  }, [data?.results]);

  // Get total count across all stages
  const totalCount = useMemo(() => {
    return Object.values(conceptsByStage).reduce(
      (sum, concepts) => sum + concepts.length,
      0,
    );
  }, [conceptsByStage]);

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      identifier,
      status,
    }: {
      identifier: string;
      status: ConceptStatus;
    }) => api.concept.updateConceptStatus(identifier, status),
    onSuccess: () => {
      queryClient.invalidateQueries([AucctusQueryKeys.concepts]);
      toast.success('Status Updated', 'Concept moved to new stage');
    },
    onError: () => {
      toast.error('Update Failed', 'Could not update concept status');
    },
  });

  // Find concept by identifier
  const findConceptByIdentifier = useCallback(
    (identifier: string): IConcept | undefined => {
      return data?.results?.find((c) => c.identifier === identifier);
    },
    [data?.results],
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const conceptIdentifier = active.id as string;
      const targetStage = over.id as PipelineStage;
      const targetStatus = STAGE_TO_TARGET_STATUS[targetStage];

      // Find current concept
      const concept = findConceptByIdentifier(conceptIdentifier);
      if (!concept) return;

      // Check if the concept is already in the target stage
      const currentStage = PIPELINE_STAGES.find((s) =>
        s.statusList.includes(concept.status),
      );
      if (currentStage?.key === targetStage) return;

      // Update the status
      updateStatusMutation.mutate({
        identifier: conceptIdentifier,
        status: targetStatus,
      });
    },
    [findConceptByIdentifier, updateStatusMutation],
  );

  return {
    conceptsByStage,
    totalCount,
    isLoading,
    handleDragEnd,
    refetch,
    findConceptByIdentifier,
    isUpdating: updateStatusMutation.isLoading,
    filterOptions,
    updateFilterOptions,
  };
};
