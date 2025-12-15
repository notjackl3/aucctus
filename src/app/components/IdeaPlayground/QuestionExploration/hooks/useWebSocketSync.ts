import { toast } from '@components';
import telemetry from '@libs/telemetry';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import { useDebouncedInvalidation } from '@hooks/query/useDebouncedInvalidation';
import { AucctusQueryKeys } from '@hooks/query/query-keys';

interface UseWebSocketSyncProps {
  seedUuid: string | null;
  currentQuestionId: string | undefined;
  addLoadingOperation: (
    questionId: string,
    operation: 'insights' | 'possibleAnswer',
  ) => void;
  removeLoadingOperation: (
    questionId: string,
    operation: 'insights' | 'possibleAnswer',
  ) => void;
}

/**
 * Hook for managing WebSocket event listeners for the question carousel
 */
export const useWebSocketSync = ({
  seedUuid,
  currentQuestionId,
  addLoadingOperation,
  removeLoadingOperation,
}: UseWebSocketSyncProps) => {
  const { debouncedInvalidate } = useDebouncedInvalidation();

  // WebSocket listener for questions generated
  useSocketEvent<'idea_playground.questions.generated.user'>(
    'idea_playground.questions.generated.user',
    (data) => {
      if (data.seedUuid === seedUuid) {
        telemetry.log('ideaPlayground.questions.generated.websocket', {
          questionCount: data.questionCount,
        });
        // Invalidate questions query to refetch
        debouncedInvalidate([
          AucctusQueryKeys.ideaPlaygroundQuestions,
          seedUuid,
        ]);
      }
    },
  );

  // WebSocket listener for insight enhancement
  useSocketEvent<'idea_playground.insight.enhanced.user'>(
    'idea_playground.insight.enhanced.user',
    (data) => {
      if (data.seedUuid === seedUuid) {
        // Invalidate questions query to get updated insights
        debouncedInvalidate([
          AucctusQueryKeys.ideaPlaygroundQuestions,
          data.seedUuid,
        ]);
        telemetry.log('ideaPlayground.insight.enhanced.websocket', {
          insightUuid: data.insightUuid,
        });
      }
    },
  );

  // WebSocket listener for insight validation failure
  useSocketEvent<'idea_playground.insight.validation_failed.user'>(
    'idea_playground.insight.validation_failed.user',
    (data) => {
      if (data.seedUuid === seedUuid) {
        // Invalidate questions query to get updated insight with failed status
        debouncedInvalidate([
          AucctusQueryKeys.ideaPlaygroundQuestions,
          data.seedUuid,
        ]);
        telemetry.log('ideaPlayground.insight.validation_failed.websocket', {
          insightUuid: data.insightUuid,
          error: data.errorMessage,
        });
      }
    },
  );

  // WebSocket listener for possible answer generated
  useSocketEvent<'idea_playground.possible_answer.generated.user'>(
    'idea_playground.possible_answer.generated.user',
    (data) => {
      if (data.seedUuid === seedUuid) {
        telemetry.log('ideaPlayground.possibleAnswer.generated.websocket', {
          questionUuid: data.questionUuid,
        });

        // Remove loading operation for this question
        removeLoadingOperation(data.questionUuid, 'possibleAnswer');

        // Invalidate React Query cache to refetch questions with new possible answer
        debouncedInvalidate([
          AucctusQueryKeys.ideaPlaygroundQuestions,
          data.seedUuid,
        ]);
      }
    },
  );

  // WebSocket listener for research insights generated
  useSocketEvent<'idea_playground.research_insights.generated.user'>(
    'idea_playground.research_insights.generated.user',
    (data) => {
      if (data.seedUuid === seedUuid) {
        telemetry.log('ideaPlayground.insights.generated.websocket', {
          questionUuid: data.questionUuid,
          insightCount: data.insightCount,
        });

        // Remove loading operation for this question
        removeLoadingOperation(data.questionUuid, 'insights');

        // Invalidate React Query cache to refetch questions with new insights
        debouncedInvalidate([
          AucctusQueryKeys.ideaPlaygroundQuestions,
          data.seedUuid,
        ]);
      }
    },
  );

  // WebSocket listener for possible answer processing started
  useSocketEvent<'idea_playground.possible_answer.processing.user'>(
    'idea_playground.possible_answer.processing.user',
    (data) => {
      if (data.seedUuid === seedUuid) {
        telemetry.log('ideaPlayground.possibleAnswer.processing.websocket', {
          questionUuid: data.questionUuid,
        });

        // Add loading operation for this question
        addLoadingOperation(data.questionUuid, 'possibleAnswer');
      }
    },
  );

  // WebSocket listener for research insights processing started
  useSocketEvent<'idea_playground.research_insights.processing.user'>(
    'idea_playground.research_insights.processing.user',
    (data) => {
      if (data.seedUuid === seedUuid) {
        telemetry.log('ideaPlayground.insights.processing.websocket', {
          questionUuid: data.questionUuid,
        });

        // Add loading operation for this question
        addLoadingOperation(data.questionUuid, 'insights');
      }
    },
  );

  // WebSocket listener for errors
  useSocketEvent<'idea_playground.error.user'>(
    'idea_playground.error.user',
    (data) => {
      if (data.seedUuid === seedUuid) {
        telemetry.error('ideaPlayground.error.websocket', {
          operation: data.operation,
          error: data.errorMessage,
          details: data.details,
        });

        // Extract question UUID from details if available for per-question error handling
        const questionUuid =
          data.details?.questionUuid || data.details?.question_uuid;
        const targetQuestionId = questionUuid || currentQuestionId;

        if (targetQuestionId) {
          // Determine which operation failed and remove it
          const operation = data.operation?.toLowerCase();
          if (operation?.includes('insight')) {
            removeLoadingOperation(targetQuestionId, 'insights');
          } else if (operation?.includes('answer')) {
            removeLoadingOperation(targetQuestionId, 'possibleAnswer');
          } else {
            // If we can't determine the specific operation, clear all operations for this question
            removeLoadingOperation(targetQuestionId, 'insights');
            removeLoadingOperation(targetQuestionId, 'possibleAnswer');
          }
        }

        // Show error toast
        toast.error(
          data.errorMessage || 'An error occurred. Please try again.',
        );
      }
    },
  );
};
