import { useCallback } from 'react';
import { useMutation } from 'react-query';
import { AxiosError } from 'axios';
import { toast } from '@components';
import api from '@libs/api';
import utils from '@libs/utils';
import telemetry from '@libs/telemetry';
import { useDebouncedInvalidation } from '@hooks/query/useDebouncedInvalidation';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import type { IAnchorQuestion } from '@libs/api/types';

interface UseBulkQuestionsUpdateProps {
  seedUuid: string | null;
  inputsAtGeneration: Record<string, string[]> | null;
  questionsSnapshotAtGeneration: IAnchorQuestion[] | null;
  setSelectedInsights: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >;
}

/**
 * Hook for bulk updating questions (used for revert functionality)
 */
export const useBulkQuestionsUpdate = ({
  seedUuid,
  inputsAtGeneration,
  questionsSnapshotAtGeneration,
  setSelectedInsights,
}: UseBulkQuestionsUpdateProps) => {
  const { debouncedInvalidate } = useDebouncedInvalidation();

  // Mutation for bulk updating questions (for revert)
  const bulkUpdateQuestionsMutation = useMutation({
    mutationFn: async (questions: IAnchorQuestion[]) => {
      if (!seedUuid) throw new Error('No seed UUID');
      // Convert apiQuestions to the bulk update format
      const request = {
        questions: questions.map((q) => ({
          uuid: q.uuid,
          question: q.question,
          question_type: q.questionType,
          description: q.description || '',
          possible_answers:
            q.possibleAnswers?.map((pa) => ({
              uuid: pa.uuid,
              answer: pa.answer,
            })) || [],
          combined_insights:
            q.insights?.map((ri) => {
              // Determine source_type from explicit field or infer from properties:
              // - File: No URL and sourceTitle is a filename (not "Nucleus Report")
              // - Nucleus: sourceCredibility === 1 or sourceUrl is null with "Nucleus Report" title
              // - Research: Has actual sourceUrl and sourceTitle values
              let sourceType: 'research' | 'nucleus' | 'file' | 'persona' =
                'research';
              if (ri.sourceType) {
                sourceType = ri.sourceType;
              } else if (
                ri.sourceCredibility === 1 ||
                (!ri.sourceUrl && ri.sourceTitle === 'Nucleus Report')
              ) {
                sourceType = 'nucleus';
              } else if (
                !ri.sourceUrl &&
                ri.sourceTitle &&
                ri.sourceTitle !== 'Nucleus Report'
              ) {
                sourceType = 'file';
              } else {
                sourceType = 'research';
              }

              return {
                uuid: ri.uuid,
                insight: ri.insight,
                source_type: sourceType,
                source_url: ri.sourceUrl,
                source_title: ri.sourceTitle,
                source_credibility: ri.sourceCredibility,
                sentiment: ri.sentiment,
                persona_uuid: ri.personaUuid,
                more_details: ri.moreDetails,
                why_it_matters: ri.whyItMatters,
                citation_validation_status: ri.citationValidationStatus,
              };
            }) || [],
          user_answers: q.userAnswers.map((ua) => ({
            uuid: ua.uuid,
            answer: ua.answer,
          })),
          included_answers: q.includedAnswers || [],
          is_custom_question: q.isCustomQuestion || false,
        })),
      };
      return await api.ideaPlayground.bulkUpdateQuestions(seedUuid, request);
    },
    onSuccess: () => {
      // Invalidate questions query to refetch
      if (seedUuid) {
        debouncedInvalidate([
          AucctusQueryKeys.ideaPlaygroundQuestions,
          seedUuid,
        ]);
      }
    },
    onError: (error: AxiosError) => {
      const message = utils.osiris.parseFormError(error);
      toast.error(message || 'Failed to revert changes. Please try again.');
      telemetry.error('ideaPlayground.revert.failed', error);
    },
  });

  // Revert selections back to the state when concepts were generated
  const revertToGenerationState = useCallback(async () => {
    if (inputsAtGeneration !== null) {
      // Revert local UI state immediately
      setSelectedInsights({ ...inputsAtGeneration });

      // If we have a full questions snapshot, call the API to sync backend
      if (questionsSnapshotAtGeneration && seedUuid) {
        try {
          await bulkUpdateQuestionsMutation.mutateAsync(
            questionsSnapshotAtGeneration,
          );
          telemetry.log('ideaPlayground.inputs.reverted', {
            seedUuid,
            questionCount: questionsSnapshotAtGeneration.length,
            syncedWithBackend: true,
          });
        } catch {
          // Error already handled by mutation
          telemetry.log('ideaPlayground.inputs.reverted', {
            seedUuid,
            questionCount: Object.keys(inputsAtGeneration).length,
            syncedWithBackend: false,
          });
        }
      } else {
        telemetry.log('ideaPlayground.inputs.reverted', {
          seedUuid,
          questionCount: Object.keys(inputsAtGeneration).length,
          syncedWithBackend: false,
        });
      }
    }
  }, [
    inputsAtGeneration,
    questionsSnapshotAtGeneration,
    seedUuid,
    bulkUpdateQuestionsMutation,
    setSelectedInsights,
  ]);

  return {
    bulkUpdateQuestionsMutation,
    revertToGenerationState,
  };
};
