import { useMutation, useQuery } from 'react-query';
import api from '@libs/api';
import { toast } from '@components';
import type {
  ILeadCapturePayload,
  IQuestionStatusResponse,
  IBriefingResponse,
  ISubmitAnswerPayload,
} from '@libs/api/types/valueDiscovery';

// ==========================================
// Query Keys
// ==========================================

export const publicValueDiscoveryKeys = {
  all: ['publicValueDiscovery'] as const,
  questionStatus: (uuid: string) =>
    [...publicValueDiscoveryKeys.all, 'questionStatus', uuid] as const,
  briefing: (uuid: string) =>
    [...publicValueDiscoveryKeys.all, 'briefing', uuid] as const,
};

// ==========================================
// Mutations
// ==========================================

export const usePublicStartAssessment = () => {
  const mutation = useMutation({
    mutationFn: async ({
      companyName,
      captchaToken,
    }: {
      companyName: string;
      captchaToken: string;
    }) => {
      return await api.valueDiscovery.startAssessmentPublic({
        company_name: companyName,
        captcha_token: captchaToken,
        website: '',
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

export const usePublicSubmitAnswer = () => {
  const mutation = useMutation({
    mutationFn: async ({
      assessmentUuid,
      data,
    }: {
      assessmentUuid: string;
      data: ISubmitAnswerPayload;
    }) => {
      return await api.valueDiscovery.submitAnswerPublic(assessmentUuid, data);
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

export const usePublicSubmitLead = () => {
  const mutation = useMutation({
    mutationFn: async ({
      assessmentUuid,
      data,
    }: {
      assessmentUuid: string;
      data: ILeadCapturePayload;
    }) => {
      return await api.valueDiscovery.submitLeadPublic(assessmentUuid, data);
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
// Queries (Polling)
// ==========================================

export const usePublicQuestionStatus = (
  assessmentUuid: string | null,
  enabled: boolean,
) => {
  const query = useQuery({
    queryKey: publicValueDiscoveryKeys.questionStatus(assessmentUuid ?? ''),
    queryFn: async (): Promise<IQuestionStatusResponse> => {
      return await api.valueDiscovery.getQuestionStatusPublic(assessmentUuid!);
    },
    enabled: enabled && !!assessmentUuid,
    refetchInterval: (data?: IQuestionStatusResponse) => {
      if (data?.status === 'ready' || data?.status === 'complete') {
        return false;
      }
      return 2000;
    },
  });

  return {
    questionStatus: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

export const usePublicBriefing = (
  assessmentUuid: string | null,
  enabled: boolean,
) => {
  const query = useQuery({
    queryKey: publicValueDiscoveryKeys.briefing(assessmentUuid ?? ''),
    queryFn: async (): Promise<IBriefingResponse> => {
      return await api.valueDiscovery.getBriefingPublic(assessmentUuid!);
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
