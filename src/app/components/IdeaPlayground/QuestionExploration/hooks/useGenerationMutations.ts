import { useMutation } from 'react-query';
import { AxiosError } from 'axios';
import api from '@libs/api';
import telemetry from '@libs/telemetry';
import { isGenerationInProgress } from '@libs/api/ideaPlayground';
import { useDebouncedInvalidation } from '@hooks/query/useDebouncedInvalidation';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import type { IResearchInsight as IApiResearchInsight } from '@libs/api/types';

interface UseGenerationMutationsProps {
  removeLoadingOperation: (
    questionId: string,
    operation: 'insights' | 'possibleAnswer',
  ) => void;
}

/**
 * Hook for managing insight and possible answer generation mutations
 */
export const useGenerationMutations = ({
  removeLoadingOperation,
}: UseGenerationMutationsProps) => {
  const { debouncedInvalidate } = useDebouncedInvalidation();

  // Mutation for generating research insights
  const generateInsightsMutation = useMutation({
    mutationFn: async ({
      seedUuid,
      questionUuid,
    }: {
      seedUuid: string;
      questionUuid: string;
    }) => {
      return await api.ideaPlayground.generateResearchInsights(
        seedUuid,
        questionUuid,
      );
    },
    onSuccess: (data, variables) => {
      // Check if generation is in progress (202 response)
      if (isGenerationInProgress(data)) {
        // Generation started, will be notified via WebSocket - keep loading state
        return;
      }
      // Sync response - remove loading state immediately
      removeLoadingOperation(variables.questionUuid, 'insights');

      // Invalidate questions query to refetch with new insights
      debouncedInvalidate([
        AucctusQueryKeys.ideaPlaygroundQuestions,
        variables.seedUuid,
      ]);
      telemetry.log('ideaPlayground.insights.generated', {
        questionUuid: variables.questionUuid,
        count: (data as IApiResearchInsight[]).length,
      });
    },
    onError: (error: AxiosError, variables) => {
      // Remove loading state on error
      removeLoadingOperation(variables.questionUuid, 'insights');

      telemetry.error('ideaPlayground.insights.generate.failed', error);
    },
  });

  // Mutation for generating possible answers (AI suggestions)
  // Note: Backend returns an array of all possible answers for the question
  const generatePossibleAnswerMutation = useMutation({
    mutationFn: async ({
      seedUuid,
      questionUuid,
    }: {
      seedUuid: string;
      questionUuid: string;
    }) => {
      return await api.ideaPlayground.generatePossibleAnswer(
        seedUuid,
        questionUuid,
      );
    },
    onSuccess: (data, variables) => {
      // Check if generation is in progress (202 response)
      if (isGenerationInProgress(data)) {
        // Generation started, will be notified via WebSocket - keep loading state
        return;
      }
      // Sync response - remove loading state immediately
      removeLoadingOperation(variables.questionUuid, 'possibleAnswer');

      // Invalidate questions query to refetch with new possible answers
      debouncedInvalidate([
        AucctusQueryKeys.ideaPlaygroundQuestions,
        variables.seedUuid,
      ]);
      telemetry.log('ideaPlayground.possibleAnswer.generated', {
        questionUuid: variables.questionUuid,
        count: Array.isArray(data) ? data.length : 0,
      });
    },
    onError: (error: AxiosError, variables) => {
      // Remove loading state on error
      removeLoadingOperation(variables.questionUuid, 'possibleAnswer');

      telemetry.error('ideaPlayground.possibleAnswer.generate.failed', error);
    },
  });

  return {
    generateInsightsMutation,
    generatePossibleAnswerMutation,
    debouncedInvalidate,
  };
};
