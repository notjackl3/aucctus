import { toast } from '@components';
import api from '@libs/api';
import { IFormError } from '@libs/api/types';
import {
  NucleusQuestionCreateRequest,
  NucleusQuestionUpdateRequest,
  NucleusAnswerCreateRequest,
  NucleusAnswerUpdateRequest,
  NucleusSectionUpdateRequest,
  NucleusReportQuestion,
  NucleusReportAnswer,
  NucleusReportSection,
} from '@libs/api/types/nucleus';
import analytics from '@libs/telemetry';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from 'react-query';
import { AucctusQueryKeys } from './query-keys';

// Validation helper functions
const validateQuestionData = (
  data: NucleusQuestionCreateRequest | NucleusQuestionUpdateRequest,
) => {
  const errors: string[] = [];

  if (!data.question || data.question.trim() === '') {
    errors.push('Question is required');
  }

  if (data.question && data.question.length > 500) {
    errors.push('Question must be 500 characters or less');
  }

  // For create requests, whyItMatters is required
  if (
    'whyItMatters' in data &&
    (!data.whyItMatters || data.whyItMatters.trim() === '')
  ) {
    errors.push('Why it matters is required');
  }

  if (data.whyItMatters && data.whyItMatters.length > 500) {
    errors.push('Why it matters must be 500 characters or less');
  }

  return errors;
};

const validateAnswerData = (
  data: NucleusAnswerCreateRequest | NucleusAnswerUpdateRequest,
) => {
  const errors: string[] = [];

  if (!data.answer || data.answer.trim() === '') {
    errors.push('Answer is required');
  }

  if (data.answer && data.answer.length > 2000) {
    errors.push('Answer must be 2000 characters or less');
  }

  // Sources are optional, only validate if they exist and have content
  if (data.sources && data.sources.length > 0) {
    data.sources.forEach((source, index) => {
      const hasAnyContent =
        source.title?.trim() ||
        source.url?.trim() ||
        source.description?.trim();

      if (hasAnyContent) {
        if (!source.title || source.title.trim() === '') {
          errors.push(`Source ${index + 1}: Title is required`);
        }

        if (source.title && source.title.length > 200) {
          errors.push(
            `Source ${index + 1}: Title must be 200 characters or less`,
          );
        }

        if (!source.url || source.url.trim() === '') {
          errors.push(`Source ${index + 1}: URL is required`);
        }

        if (source.url) {
          try {
            new URL(source.url);
          } catch {
            errors.push(`Source ${index + 1}: Invalid URL format`);
          }
        }

        if (source.description && source.description.length > 500) {
          errors.push(
            `Source ${index + 1}: Description must be 500 characters or less`,
          );
        }
      }
    });
  }

  return errors;
};

// Section mutation hooks
export const useUpdateSection = (reportUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    NucleusReportSection,
    AxiosError<IFormError<NucleusReportSection>>,
    { sectionUuid: string; data: NucleusSectionUpdateRequest }
  >({
    mutationFn: async ({ sectionUuid, data }) => {
      return api.nucleus.updateSection(reportUuid, sectionUuid, data);
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.nucleusReportLatest],
        }),
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.nucleusReport, reportUuid],
        }),
      ]);
      toast.success(
        'Section Updated',
        'Nucleus section has been updated successfully',
      );
    },
    onError: (e) => {
      analytics.debug('Error updating section:', e);
      const message = utils.osiris.parseFormError(e) || e.message;
      toast.error(
        'Section Update Failed',
        message || 'Unable to update section',
      );
    },
  });
};

// Question mutation hooks
export const useCreateQuestion = (reportUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    NucleusReportQuestion,
    AxiosError<IFormError<NucleusReportQuestion>>,
    { sectionUuid: string; data: NucleusQuestionCreateRequest }
  >({
    mutationFn: async ({ sectionUuid, data }) => {
      const errors = validateQuestionData(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      return api.nucleus.createQuestion(reportUuid, sectionUuid, data);
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.nucleusReportLatest],
        }),
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.nucleusReport, reportUuid],
        }),
      ]);
      toast.success(
        'Question Created',
        'Nucleus question has been created successfully',
      );
    },
    onError: (e) => {
      analytics.debug('Error creating question:', e);
      const message = utils.osiris.parseFormError(e) || e.message;
      toast.error(
        'Question Creation Failed',
        message || 'Unable to create question',
      );
    },
  });
};

export const useUpdateQuestion = (reportUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    NucleusReportQuestion,
    AxiosError<IFormError<NucleusReportQuestion>>,
    { questionUuid: string; data: NucleusQuestionUpdateRequest }
  >({
    mutationFn: async ({ questionUuid, data }) => {
      const errors = validateQuestionData(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      return api.nucleus.updateQuestion(reportUuid, questionUuid, data);
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.nucleusReportLatest],
        }),
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.nucleusReport, reportUuid],
        }),
      ]);
      toast.success(
        'Question Updated',
        'Nucleus question has been updated successfully',
      );
    },
    onError: (e) => {
      analytics.debug('Error updating question:', e);
      const message = utils.osiris.parseFormError(e) || e.message;
      toast.error(
        'Question Update Failed',
        message || 'Unable to update question',
      );
    },
  });
};

export const useDeleteQuestion = (reportUuid: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ questionUuid }: { questionUuid: string }) => {
      return api.nucleus.deleteQuestion(reportUuid, questionUuid);
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.nucleusReportLatest],
        }),
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.nucleusReport, reportUuid],
        }),
      ]);
      toast.success(
        'Question Deleted',
        'Nucleus question has been removed successfully',
      );
    },
    onError: (e: AxiosError<IFormError<any>>) => {
      analytics.debug('Error deleting question:', e);
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Question Deletion Failed',
        message || 'Unable to delete question',
      );
    },
  });

  return mutation;
};

// Answer mutation hooks
export const useCreateAnswer = (reportUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    NucleusReportAnswer,
    AxiosError<IFormError<NucleusReportAnswer>>,
    { questionUuid: string; data: NucleusAnswerCreateRequest }
  >({
    mutationFn: async ({ questionUuid, data }) => {
      const errors = validateAnswerData(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      return api.nucleus.createAnswer(reportUuid, questionUuid, data);
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.nucleusReportLatest],
        }),
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.nucleusReport, reportUuid],
        }),
      ]);
      toast.success(
        'Answer Created',
        'Nucleus answer has been added successfully',
      );
    },
    onError: (e) => {
      analytics.debug('Error creating answer:', e);
      const message = utils.osiris.parseFormError(e) || e.message;
      toast.error(
        'Answer Creation Failed',
        message || 'Unable to create answer',
      );
    },
  });
};

export const useUpdateAnswer = (reportUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    NucleusReportAnswer,
    AxiosError<IFormError<NucleusReportAnswer>>,
    { answerUuid: string; data: NucleusAnswerUpdateRequest }
  >({
    mutationFn: async ({ answerUuid, data }) => {
      const errors = validateAnswerData(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      return api.nucleus.updateAnswer(reportUuid, answerUuid, data);
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.nucleusReportLatest],
        }),
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.nucleusReport, reportUuid],
        }),
      ]);
      toast.success(
        'Answer Updated',
        'Nucleus answer has been updated successfully',
      );
    },
    onError: (e) => {
      analytics.debug('Error updating answer:', e);
      const message = utils.osiris.parseFormError(e) || e.message;
      toast.error('Answer Update Failed', message || 'Unable to update answer');
    },
  });
};

export const useDeleteAnswer = (reportUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ answerUuid }: { answerUuid: string }) => {
      return api.nucleus.deleteAnswer(reportUuid, answerUuid);
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.nucleusReportLatest],
        }),
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.nucleusReport, reportUuid],
        }),
      ]);
      toast.success(
        'Answer Deleted',
        'Nucleus answer has been removed successfully',
      );
    },
    onError: (e: AxiosError<IFormError<any>>) => {
      analytics.debug('Error deleting answer:', e);
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Answer Deletion Failed',
        message || 'Unable to delete answer',
      );
    },
  });
};
