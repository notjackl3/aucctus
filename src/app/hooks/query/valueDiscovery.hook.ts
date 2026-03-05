import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import api from '@libs/api';
import { toast } from '@components';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import type {
  IBriefingResponse,
  ILeadCapturePayload,
  IQuestion,
  ISubmitAnswerPayload,
} from '@libs/api/types/valueDiscovery';

// ==========================================
// Query Keys
// ==========================================

export const valueDiscoveryKeys = {
  all: ['valueDiscovery'] as const,
  briefing: (uuid: string) =>
    [...valueDiscoveryKeys.all, 'briefing', uuid] as const,
  assessment: (uuid: string) =>
    [...valueDiscoveryKeys.all, 'assessment', uuid] as const,
};

// ==========================================
// Mutations
// ==========================================

export const useStartAssessment = () => {
  const mutation = useMutation({
    mutationFn: async (companyName: string) => {
      return await api.valueDiscovery.startAssessment({
        company_name: companyName,
      });
    },
    onError: () => {
      toast.error(
        'Assessment Error',
        'Failed to start assessment. Please try again.',
      );
    },
  });

  return {
    startAssessment: mutation.mutateAsync,
    isStarting: mutation.isLoading,
  };
};

export const useSubmitAnswer = () => {
  const mutation = useMutation({
    mutationFn: async ({
      assessmentUuid,
      data,
    }: {
      assessmentUuid: string;
      data: ISubmitAnswerPayload;
    }) => {
      return await api.valueDiscovery.submitAnswer(assessmentUuid, data);
    },
    onError: () => {
      toast.error('Error', 'Failed to submit answer. Please try again.');
    },
  });

  return {
    submitAnswer: mutation.mutateAsync,
    isSubmitting: mutation.isLoading,
  };
};

export const useSubmitLead = () => {
  const mutation = useMutation({
    mutationFn: async ({
      assessmentUuid,
      data,
    }: {
      assessmentUuid: string;
      data: ILeadCapturePayload;
    }) => {
      return await api.valueDiscovery.submitLead(assessmentUuid, data);
    },
    onError: () => {
      toast.error('Error', 'Failed to submit information. Please try again.');
    },
  });

  return {
    submitLead: mutation.mutateAsync,
    isSubmitting: mutation.isLoading,
  };
};

// ==========================================
// Queries
// ==========================================

export const useBriefing = (
  assessmentUuid: string | null,
  enabled: boolean,
) => {
  const query = useQuery({
    queryKey: valueDiscoveryKeys.briefing(assessmentUuid ?? ''),
    queryFn: async (): Promise<IBriefingResponse> => {
      return await api.valueDiscovery.getBriefing(assessmentUuid!);
    },
    enabled: enabled && !!assessmentUuid,
    refetchInterval: (data?: IBriefingResponse) => {
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 3000;
    },
  });

  return {
    briefingData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

// ==========================================
// WebSocket Hooks
// ==========================================

interface ValueDiscoveryProgress {
  isGenerating: boolean;
  stage: string;
  progress: number;
  message: string;
}

const DEFAULT_PROGRESS: ValueDiscoveryProgress = {
  isGenerating: false,
  stage: '',
  progress: 0,
  message: '',
};

/**
 * Listens for question generation events via WebSocket.
 *
 * When Celery finishes generating a question, it delivers it here.
 * The page component uses the returned callbacks to react to new questions.
 */
export const useValueDiscoveryQuestionSocket = (
  onQuestionReady: (question: IQuestion, questionNumber: number) => void,
  onQuestionsComplete: () => void,
  onQuestionError: (message: string) => void,
) => {
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);

  useSocketEvent<'value_discovery.question.ready.account'>(
    'value_discovery.question.ready.account',
    useCallback(
      (data) => {
        setIsGeneratingQuestion(false);

        if (data.isComplete) {
          onQuestionsComplete();
        } else if (data.questionText && data.questionType) {
          onQuestionReady(
            {
              questionText: data.questionText,
              questionType: data.questionType as IQuestion['questionType'],
              questionOptions: data.questionOptions,
            },
            data.questionNumber,
          );
        }
      },
      [onQuestionReady, onQuestionsComplete],
    ),
  );

  useSocketEvent<'value_discovery.question.error.account'>(
    'value_discovery.question.error.account',
    useCallback(
      (data) => {
        setIsGeneratingQuestion(false);
        onQuestionError(data.message);
      },
      [onQuestionError],
    ),
  );

  return {
    isGeneratingQuestion,
    setIsGeneratingQuestion,
  };
};

/**
 * Listens for briefing generation progress/completion/error events.
 */
export const useValueDiscoverySocket = () => {
  const queryClient = useQueryClient();
  const [briefingProgress, setBriefingProgress] =
    useState<ValueDiscoveryProgress>(DEFAULT_PROGRESS);

  useSocketEvent<'value_discovery.briefing.progress.account'>(
    'value_discovery.briefing.progress.account',
    useCallback((data) => {
      setBriefingProgress({
        isGenerating: data.stage !== 'completed',
        stage: data.stage,
        progress: data.progress,
        message: data.message,
      });
    }, []),
  );

  useSocketEvent<'value_discovery.briefing.completed.account'>(
    'value_discovery.briefing.completed.account',
    useCallback(
      (data) => {
        setBriefingProgress(DEFAULT_PROGRESS);
        queryClient.invalidateQueries({
          queryKey: valueDiscoveryKeys.briefing(data.assessmentUuid),
        });
      },
      [queryClient],
    ),
  );

  useSocketEvent<'value_discovery.briefing.error.account'>(
    'value_discovery.briefing.error.account',
    useCallback((data) => {
      setBriefingProgress(DEFAULT_PROGRESS);
      toast.error('Briefing Error', data.message);
    }, []),
  );

  return {
    briefingProgress,
  };
};
