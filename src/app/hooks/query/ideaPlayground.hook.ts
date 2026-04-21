import { toast } from '@components';
import api from '@libs/api';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { AucctusQueryKeys } from './query-keys';
import telemetry from '@libs/telemetry';
import { useState, useEffect } from 'react';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import { isGenerationInProgress } from '@libs/api/ideaPlayground';
import type {
  IResearchInsight,
  IPossibleAnswer,
  IConceptGenerationResponse,
  IAnchorQuestion,
  IUserAnswer,
} from '@libs/api/types';

/**
 * Custom hook for fetching anchor thoughts.
 * Returns pre-generated anchor thoughts for idea generation.
 */
export const useAnchorThoughts = () => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.ideaPlaygroundAnchorThoughts],
    queryFn: async () => await api.ideaPlayground.getAnchorThoughts(),
    staleTime: 5 * 60, // 5 minutes - anchor thoughts don't change often
    cacheTime: 1 * 60, // 1 minutes
    refetchOnWindowFocus: false,
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        message || 'Failed to load anchor thoughts. Please try again.',
      );
      telemetry.error('ideaPlayground.anchorThoughts.loadFailed', e);
    },
  });

  return {
    ...query,
    anchorThoughts: query.data || [],
    hasThoughts: (query.data || []).length > 0,
  };
};

/**
 * Input type for creating a seed with optional file upload
 */
interface ICreateSeedInput {
  thoughtText: string;
  files?: File[];
  livingPersonaUuids?: string[];
  considerAllPersonas?: boolean;
}

/**
 * Custom hook for creating a seed with an anchor thought.
 * Returns a mutation function for creating a new idea playground session.
 * Optionally accepts a file to upload (max 10MB, supports all Gemini-compatible types).
 */
export const useCreateSeed = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: ICreateSeedInput | string) => {
      // Support both string (legacy) and object (with file) inputs
      const thoughtText = typeof input === 'string' ? input : input.thoughtText;
      const files = typeof input === 'string' ? undefined : input.files;
      const livingPersonaUuids =
        typeof input === 'string' ? undefined : input.livingPersonaUuids;
      const considerAllPersonas =
        typeof input === 'string' ? undefined : input.considerAllPersonas;

      if (!thoughtText?.trim()) {
        throw new Error('Thought text is required');
      }
      return await api.ideaPlayground.createSeedWithThought(
        thoughtText,
        files,
        livingPersonaUuids,
        considerAllPersonas,
      );
    },
    onSuccess: (data, input) => {
      const hasFiles = typeof input !== 'string' && !!input.files?.length;
      telemetry.log('ideaPlayground.seed.created', {
        seedUuid: data.seedUuid,
        thoughtLength: data.anchorThought.thought.length,
        hasFiles,
        fileNames:
          hasFiles && typeof input !== 'string'
            ? input.files?.map((f) => f.name)
            : undefined,
      });
      // Invalidate and refetch questions for this seed
      queryClient.invalidateQueries([
        AucctusQueryKeys.ideaPlaygroundQuestions,
        data.seedUuid,
      ]);
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to create seed. Please try again.');
      telemetry.error('ideaPlayground.seed.create.failed', e);
    },
  });

  return {
    createSeed: mutation.mutate,
    createSeedAsync: mutation.mutateAsync,
    isCreating: mutation.isLoading,
    seedData: mutation.data,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

/**
 * Custom hook for fetching the anchor thought for a seed.
 * Returns the anchor thought that was used to create this seed.
 */
export const useAnchorThought = (seedUuid?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.ideaPlaygroundAnchorThought, seedUuid],
    queryFn: async () =>
      seedUuid
        ? await api.ideaPlayground.getAnchorThoughtForSeed(seedUuid)
        : null,
    enabled: !!seedUuid,
    staleTime: 1000 * 60 * 30, // 30 minutes - anchor thoughts don't change
    cacheTime: 1000 * 60 * 60, // 60 minutes
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        message || 'Failed to load anchor thought. Please try again.',
      );
      telemetry.error('ideaPlayground.anchorThought.load.failed', e);
    },
    onSuccess: (data) => {
      if (data) {
        telemetry.log('ideaPlayground.anchorThought.loaded', {
          seedUuid,
          thoughtLength: data.thought.length,
        });
      }
    },
  });

  return {
    ...query,
    anchorThought: query.data,
    hasAnchorThought: !!query.data,
  };
};

/**
 * Custom hook for fetching questions for a seed.
 * Returns anchor questions that guide idea exploration.
 */
export const useQuestions = (seedUuid?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.ideaPlaygroundQuestions, seedUuid],
    queryFn: async () =>
      seedUuid ? await api.ideaPlayground.getQuestions(seedUuid) : [],
    enabled: !!seedUuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to load questions. Please try again.');
      telemetry.error('ideaPlayground.questions.load.failed', e);
    },
    onSuccess: (data) => {
      telemetry.log('ideaPlayground.questions.loaded', {
        count: data?.length || 0,
        seedUuid,
      });
    },
  });

  return {
    ...query,
    questions: query.data || [],
    hasQuestions: (query.data || []).length > 0,
  };
};

/**
 * Custom hook for generating research insights for a question.
 * Returns a mutation function for generating AI-powered insights.
 * Handles 202 Accepted responses with WebSocket notifications and 1-minute polling fallback.
 */
export const useGenerateResearchInsights = (
  seedUuid: string,
  questionUuid: string,
) => {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [shouldPoll, setShouldPoll] = useState(false);

  // WebSocket listener for insights generated
  useSocketEvent<'idea_playground.research_insights.generated.user'>(
    'idea_playground.research_insights.generated.user',
    (data) => {
      if (data.seedUuid === seedUuid && data.questionUuid === questionUuid) {
        telemetry.log('ideaPlayground.insights.generated.websocket', {
          questionUuid,
          insightCount: data.insightCount,
        });
        // Trigger refetch
        setShouldPoll(false);
        mutation.mutate();
      }
    },
  );

  const mutation = useMutation({
    mutationFn: async () => {
      if (!seedUuid || !questionUuid) {
        throw new Error('Seed UUID and Question UUID are required');
      }
      const response = await api.ideaPlayground.generateResearchInsights(
        seedUuid,
        questionUuid,
      );

      if (isGenerationInProgress(response)) {
        setIsGenerating(true);
        setShouldPoll(true);
        throw new Error('GENERATION_IN_PROGRESS');
      }

      setIsGenerating(false);
      setShouldPoll(false);
      return response as IResearchInsight[];
    },
    onSuccess: (data) => {
      telemetry.log('ideaPlayground.insights.generated', {
        questionUuid,
        count: data.length,
      });
      queryClient.invalidateQueries([
        AucctusQueryKeys.ideaPlaygroundResearchInsights,
        seedUuid,
        questionUuid,
      ]);
    },
    onError: (e: AxiosError | Error) => {
      if (e.message === 'GENERATION_IN_PROGRESS') {
        // Not a real error, just means we're waiting
        return;
      }
      const message =
        'response' in e
          ? utils.osiris.parseFormError(e as AxiosError)
          : e.message;
      toast.error(
        message || 'Failed to generate research insights. Please try again.',
      );
      telemetry.error('ideaPlayground.insights.generate.failed', e);
      setIsGenerating(false);
      setShouldPoll(false);
    },
    retry: false,
  });

  // Polling effect - retry every 60 seconds while generating
  useEffect(() => {
    if (!shouldPoll || !isGenerating) return;

    const pollInterval = setInterval(() => {
      mutation.mutate();
    }, 60000);

    return () => clearInterval(pollInterval);
  }, [shouldPoll, isGenerating, mutation]);

  return {
    generateInsights: mutation.mutate,
    generateInsightsAsync: mutation.mutateAsync,
    isGenerating: isGenerating || mutation.isLoading,
    insights: mutation.data || [],
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

/**
 * Custom hook for generating possible answers for a question.
 * Returns a mutation function for AI-generated answer suggestions.
 * Handles 202 Accepted responses with WebSocket notifications and 1-minute polling fallback.
 * Note: Backend now returns an array of all possible answers for the question.
 */
export const useGeneratePossibleAnswer = (
  seedUuid: string,
  questionUuid: string,
) => {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [shouldPoll, setShouldPoll] = useState(false);

  // WebSocket listener for possible answer generated
  useSocketEvent<'idea_playground.possible_answer.generated.user'>(
    'idea_playground.possible_answer.generated.user',
    (data) => {
      if (data.seedUuid === seedUuid && data.questionUuid === questionUuid) {
        telemetry.log('ideaPlayground.possibleAnswer.generated.websocket', {
          questionUuid,
        });
        // Trigger refetch
        setShouldPoll(false);
        mutation.mutate();
      }
    },
  );

  const mutation = useMutation({
    mutationFn: async () => {
      if (!seedUuid || !questionUuid) {
        throw new Error('Seed UUID and Question UUID are required');
      }
      const response = await api.ideaPlayground.generatePossibleAnswer(
        seedUuid,
        questionUuid,
      );

      if (isGenerationInProgress(response)) {
        setIsGenerating(true);
        setShouldPoll(true);
        throw new Error('GENERATION_IN_PROGRESS');
      }

      setIsGenerating(false);
      setShouldPoll(false);
      return response as IPossibleAnswer[];
    },
    onSuccess: (data) => {
      telemetry.log('ideaPlayground.possibleAnswer.generated', {
        questionUuid,
        count: data?.length || 0,
      });
      queryClient.invalidateQueries([
        AucctusQueryKeys.ideaPlaygroundPossibleAnswer,
        seedUuid,
        questionUuid,
      ]);
    },
    onError: (e: AxiosError | Error) => {
      if (e.message === 'GENERATION_IN_PROGRESS') {
        // Not a real error, just means we're waiting
        return;
      }
      const message =
        'response' in e
          ? utils.osiris.parseFormError(e as AxiosError)
          : e.message;
      toast.error(
        message || 'Failed to generate possible answer. Please try again.',
      );
      telemetry.error('ideaPlayground.possibleAnswer.generate.failed', e);
      setIsGenerating(false);
      setShouldPoll(false);
    },
    retry: false,
  });

  // Polling effect - retry every 60 seconds while generating
  useEffect(() => {
    if (!shouldPoll || !isGenerating) return;

    const pollInterval = setInterval(() => {
      mutation.mutate();
    }, 60000);

    return () => clearInterval(pollInterval);
  }, [shouldPoll, isGenerating, mutation]);

  return {
    generateAnswer: mutation.mutate,
    generateAnswerAsync: mutation.mutateAsync,
    isGenerating: isGenerating || mutation.isLoading,
    /** @deprecated Use possibleAnswers (plural) instead */
    possibleAnswer: mutation.data?.[0],
    possibleAnswers: mutation.data || [],
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

/**
 * Custom hook for adding a user answer to a question.
 * Returns a mutation function for submitting custom answers.
 * User answers are automatically included when created.
 */
export const useAddUserAnswer = (seedUuid: string, questionUuid: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (answer: string) => {
      if (!seedUuid || !questionUuid) {
        throw new Error('Seed UUID and Question UUID are required');
      }
      if (!answer?.trim()) {
        throw new Error('Answer is required');
      }
      return await api.ideaPlayground.addUserAnswer(
        seedUuid,
        questionUuid,
        answer,
      );
    },
    onMutate: async (answer: string) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries([
        AucctusQueryKeys.ideaPlaygroundQuestions,
        seedUuid,
      ]);
      const previousQuestions = queryClient.getQueryData<IAnchorQuestion[]>([
        AucctusQueryKeys.ideaPlaygroundQuestions,
        seedUuid,
      ]);
      // Optimistically append a temporary answer
      if (previousQuestions) {
        const tempUuid = crypto.randomUUID();
        const optimisticAnswer: IUserAnswer = {
          uuid: tempUuid,
          questionUuid,
          answer,
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData<IAnchorQuestion[]>(
          [AucctusQueryKeys.ideaPlaygroundQuestions, seedUuid],
          previousQuestions.map((q) =>
            q.uuid === questionUuid
              ? {
                  ...q,
                  userAnswers: [...q.userAnswers, optimisticAnswer],
                  includedAnswers: [...(q.includedAnswers || []), tempUuid],
                }
              : q,
          ),
        );
      }
      return { previousQuestions };
    },
    onSuccess: () => {
      toast.success('Answer saved');
      telemetry.log('ideaPlayground.userAnswer.saved', {
        questionUuid,
      });
    },
    onError: (e: AxiosError, _answer, context) => {
      // Rollback on error
      if (context?.previousQuestions) {
        queryClient.setQueryData(
          [AucctusQueryKeys.ideaPlaygroundQuestions, seedUuid],
          context.previousQuestions,
        );
      }
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to save answer. Please try again.');
      telemetry.error('ideaPlayground.userAnswer.save.failed', e);
    },
    onSettled: () => {
      // Always refetch to get the real server data
      queryClient.invalidateQueries([
        AucctusQueryKeys.ideaPlaygroundQuestions,
        seedUuid,
      ]);
    },
  });

  return {
    addAnswer: mutation.mutate,
    addAnswerAsync: mutation.mutateAsync,
    isSaving: mutation.isLoading,
    userAnswer: mutation.data,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

/**
 * Custom hook for including an answer (PossibleAnswer or ResearchInsight) for a question.
 * Adds the answer UUID to the question's included_answers list.
 *
 * This hook accepts parameters dynamically in the mutation function, making it suitable
 * for components that work with multiple questions (like carousels).
 */
export const useIncludeAnswer = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      seedUuid,
      questionUuid,
      answerUuid,
    }: {
      seedUuid: string;
      questionUuid: string;
      answerUuid: string;
    }) => {
      if (!seedUuid || !questionUuid || !answerUuid) {
        throw new Error(
          'Seed UUID, Question UUID, and Answer UUID are required',
        );
      }
      return await api.ideaPlayground.includeAnswer(
        seedUuid,
        questionUuid,
        answerUuid,
      );
    },
    onSuccess: (_, { seedUuid, questionUuid, answerUuid }) => {
      telemetry.log('ideaPlayground.answer.included', {
        questionUuid,
        answerUuid,
      });
      // Invalidate questions to refresh included_answers list
      queryClient.invalidateQueries([
        AucctusQueryKeys.ideaPlaygroundQuestions,
        seedUuid,
      ]);
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to include answer. Please try again.');
      telemetry.error('ideaPlayground.answer.include.failed', e);
    },
  });

  return {
    includeAnswer: mutation.mutate,
    includeAnswerAsync: mutation.mutateAsync,
    isIncluding: mutation.isLoading,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

/**
 * Lightweight hook for including an answer without query invalidation.
 * Use this in card components that manage their own state and notify parent via callbacks.
 * The parent is responsible for updating its state based on the callback.
 */
export const useIncludeAnswerLight = (successCallback?: () => void) => {
  const mutation = useMutation({
    mutationFn: async ({
      seedUuid,
      questionUuid,
      answerUuid,
    }: {
      seedUuid: string;
      questionUuid: string;
      answerUuid: string;
    }) => {
      if (!seedUuid || !questionUuid || !answerUuid) {
        throw new Error(
          'Seed UUID, Question UUID, and Answer UUID are required',
        );
      }
      return await api.ideaPlayground.includeAnswer(
        seedUuid,
        questionUuid,
        answerUuid,
      );
    },
    onSuccess: (_, { questionUuid, answerUuid }) => {
      telemetry.log('ideaPlayground.answer.included', {
        questionUuid,
        answerUuid,
        successCallback: successCallback ? true : false,
      });
      successCallback?.();
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to include answer. Please try again.');
      telemetry.error('ideaPlayground.answer.include.failed', e);
    },
  });

  return {
    includeAnswer: mutation.mutate,
    includeAnswerAsync: mutation.mutateAsync,
    isIncluding: mutation.isLoading,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

/**
 * Custom hook for excluding an answer (PossibleAnswer or ResearchInsight) from a question.
 * Removes the answer UUID from the question's included_answers list.
 * Does not delete the answer itself.
 *
 * This hook accepts parameters dynamically in the mutation function, making it suitable
 * for components that work with multiple questions (like carousels).
 */
export const useExcludeAnswer = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      seedUuid,
      questionUuid,
      answerUuid,
    }: {
      seedUuid: string;
      questionUuid: string;
      answerUuid: string;
    }) => {
      if (!seedUuid || !questionUuid || !answerUuid) {
        throw new Error(
          'Seed UUID, Question UUID, and Answer UUID are required',
        );
      }
      return await api.ideaPlayground.excludeAnswer(
        seedUuid,
        questionUuid,
        answerUuid,
      );
    },
    onSuccess: (_, { seedUuid, questionUuid, answerUuid }) => {
      telemetry.log('ideaPlayground.answer.excluded', {
        questionUuid,
        answerUuid,
      });
      // Invalidate questions to refresh included_answers list
      queryClient.invalidateQueries([
        AucctusQueryKeys.ideaPlaygroundQuestions,
        seedUuid,
      ]);
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to exclude answer. Please try again.');
      telemetry.error('ideaPlayground.answer.exclude.failed', e);
    },
  });

  return {
    excludeAnswer: mutation.mutate,
    excludeAnswerAsync: mutation.mutateAsync,
    isExcluding: mutation.isLoading,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

/**
 * Lightweight hook for excluding an answer without query invalidation.
 * Use this in card components that manage their own state and notify parent via callbacks.
 * The parent is responsible for updating its state based on the callback.
 */
export const useExcludeAnswerLight = (successCallback?: () => void) => {
  const mutation = useMutation({
    mutationFn: async ({
      seedUuid,
      questionUuid,
      answerUuid,
    }: {
      seedUuid: string;
      questionUuid: string;
      answerUuid: string;
    }) => {
      if (!seedUuid || !questionUuid || !answerUuid) {
        throw new Error(
          'Seed UUID, Question UUID, and Answer UUID are required',
        );
      }
      return await api.ideaPlayground.excludeAnswer(
        seedUuid,
        questionUuid,
        answerUuid,
      );
    },
    onSuccess: (_, { questionUuid, answerUuid }) => {
      telemetry.log('ideaPlayground.answer.excluded', {
        questionUuid,
        answerUuid,
      });
      successCallback?.();
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to exclude answer. Please try again.');
      telemetry.error('ideaPlayground.answer.exclude.failed', e);
    },
  });

  return {
    excludeAnswer: mutation.mutate,
    excludeAnswerAsync: mutation.mutateAsync,
    isExcluding: mutation.isLoading,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

/**
 * Custom hook for removing a specific user answer from a question.
 * Accepts answerUuid to delete an individual answer from the userAnswers list.
 *
 * This hook accepts parameters dynamically in the mutation function, making it suitable
 * for components that work with multiple questions (like carousels).
 */
export const useRemoveUserAnswer = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      seedUuid,
      questionUuid,
      answerUuid,
    }: {
      seedUuid: string;
      questionUuid: string;
      answerUuid: string;
    }) => {
      if (!seedUuid || !questionUuid || !answerUuid) {
        throw new Error(
          'Seed UUID, Question UUID, and Answer UUID are required',
        );
      }
      return await api.ideaPlayground.removeUserAnswer(
        seedUuid,
        questionUuid,
        answerUuid,
      );
    },
    onMutate: async ({ seedUuid, questionUuid, answerUuid }) => {
      await queryClient.cancelQueries([
        AucctusQueryKeys.ideaPlaygroundQuestions,
        seedUuid,
      ]);
      const previousQuestions = queryClient.getQueryData<IAnchorQuestion[]>([
        AucctusQueryKeys.ideaPlaygroundQuestions,
        seedUuid,
      ]);
      // Optimistically filter the answer from the list
      if (previousQuestions) {
        queryClient.setQueryData<IAnchorQuestion[]>(
          [AucctusQueryKeys.ideaPlaygroundQuestions, seedUuid],
          previousQuestions.map((q) =>
            q.uuid === questionUuid
              ? {
                  ...q,
                  userAnswers: q.userAnswers.filter(
                    (ua) => ua.uuid !== answerUuid,
                  ),
                  includedAnswers: (q.includedAnswers || []).filter(
                    (id) => id !== answerUuid,
                  ),
                }
              : q,
          ),
        );
      }
      return { previousQuestions };
    },
    onSuccess: (_, { questionUuid }) => {
      telemetry.log('ideaPlayground.userAnswer.removed', {
        questionUuid,
      });
    },
    onError: (e: AxiosError, { seedUuid }, context) => {
      // Rollback on error
      if (context?.previousQuestions) {
        queryClient.setQueryData(
          [AucctusQueryKeys.ideaPlaygroundQuestions, seedUuid],
          context.previousQuestions,
        );
      }
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to remove answer. Please try again.');
      telemetry.error('ideaPlayground.userAnswer.remove.failed', e);
    },
    onSettled: (_, __, { seedUuid }) => {
      queryClient.invalidateQueries([
        AucctusQueryKeys.ideaPlaygroundQuestions,
        seedUuid,
      ]);
    },
  });

  return {
    removeAnswer: mutation.mutate,
    removeAnswerAsync: mutation.mutateAsync,
    isRemoving: mutation.isLoading,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

/**
 * Custom hook for deleting a custom question from a seed.
 * Only custom questions (isCustomQuestion: true) can be deleted.
 * AI-generated questions will return a 400 error.
 */
export const useDeleteCustomQuestion = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      seedUuid,
      questionUuid,
    }: {
      seedUuid: string;
      questionUuid: string;
    }) => {
      if (!seedUuid || !questionUuid) {
        throw new Error('Seed UUID and Question UUID are required');
      }
      return await api.ideaPlayground.deleteCustomQuestion(
        seedUuid,
        questionUuid,
      );
    },
    onSuccess: (_, { seedUuid, questionUuid }) => {
      telemetry.log('ideaPlayground.customQuestion.deleted', {
        questionUuid,
      });
      // Invalidate questions to refresh the list
      queryClient.invalidateQueries([
        AucctusQueryKeys.ideaPlaygroundQuestions,
        seedUuid,
      ]);
    },
    onError: (e: AxiosError) => {
      // Check for specific error code for attempting to delete AI-generated question
      const errorData = e.response?.data as { code?: string; detail?: string };
      if (errorData?.code === 'cannot_delete_ai_question') {
        toast.error('AI-generated questions cannot be deleted.');
      } else {
        const message = utils.osiris.parseFormError(e);
        toast.error(message || 'Failed to delete question. Please try again.');
      }
      telemetry.error('ideaPlayground.customQuestion.delete.failed', e);
    },
  });

  return {
    deleteQuestion: mutation.mutate,
    deleteQuestionAsync: mutation.mutateAsync,
    isDeleting: mutation.isLoading,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

/**
 * Custom hook for generating concepts from answered questions.
 * Returns a mutation function for generating 9 concepts (Core/Adjacent/Disruptive).
 * Triggers generation only - use useGetGeneratedIdeas to fetch results.
 */
export const useGenerateConcepts = (
  seedUuid: string,
  forceRegenerate?: boolean,
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!seedUuid) {
        throw new Error('Seed UUID is required');
      }
      const response = await api.ideaPlayground.generateIdeas(
        seedUuid,
        forceRegenerate,
      );

      if (isGenerationInProgress(response)) {
        // Generation started successfully
        telemetry.log('ideaPlayground.concepts.generationStarted', {
          seedUuid,
          forceRegenerate,
        });
        return null; // No data yet, generation is in progress
      }

      // Immediate response with concepts (cached)
      return response.concepts;
    },
    onSuccess: (data) => {
      if (data) {
        telemetry.log('ideaPlayground.concepts.cached', {
          count: data.length,
          seedUuid,
        });
      }
      // Invalidate the GET query to trigger refetch
      queryClient.invalidateQueries([
        AucctusQueryKeys.ideaPlaygroundGeneratedIdeas,
        seedUuid,
      ]);
    },
    onError: (e: AxiosError | Error) => {
      const message =
        'response' in e
          ? utils.osiris.parseFormError(e as AxiosError)
          : e.message;
      toast.error(message || 'Failed to generate concepts. Please try again.');
      telemetry.error('ideaPlayground.concepts.generate.failed', e);
    },
    retry: false,
  });

  return {
    generateConcepts: mutation.mutate,
    generateConceptsAsync: mutation.mutateAsync,
    isLoading: mutation.isLoading,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

/**
 * Custom hook for checking if generated concepts exist for a seed.
 * Returns cached concepts if available, generation status if in progress, or empty arrays if no concepts.
 * Does NOT trigger generation - use this to check existing state only.
 */
export const useGetGeneratedIdeas = (seedUuid?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.ideaPlaygroundGeneratedIdeas, seedUuid],
    queryFn: async () => {
      if (!seedUuid) return null;
      const response = await api.ideaPlayground.getGeneratedIdeas(seedUuid);
      return response;
    },
    enabled: !!seedUuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    onError: (e: AxiosError) => {
      telemetry.error('ideaPlayground.generatedIdeas.check.failed', e);
      // Don't show toast for this check - it's a background check
    },
    onSuccess: (data) => {
      if (data && !isGenerationInProgress(data)) {
        telemetry.log('ideaPlayground.generatedIdeas.found', {
          seedUuid,
          conceptCount: data.concepts?.length || 0,
        });
      }
    },
  });

  // Determine the state based on the response
  const isGenerating = query.data ? isGenerationInProgress(query.data) : false;
  const hasConcepts =
    query.data && !isGenerationInProgress(query.data)
      ? query.data.concepts.length > 0
      : false;

  // Extract generatingMore from response
  const generatingMore =
    query.data && !isGenerationInProgress(query.data)
      ? (query.data.generatingMore ?? false)
      : false;

  return {
    ...query,
    generatedIdeasResponse: query.data,
    isGenerating,
    hasConcepts,
    concepts:
      query.data && !isGenerationInProgress(query.data)
        ? query.data.concepts
        : [],
    generatingMore,
  };
};

/**
 * Custom hook for deleting a generated concept from the cached concepts.
 * Removes a single concept from the seed's generated concepts list.
 * Returns a mutation function for deleting concepts.
 * Uses optimistic update to immediately remove the concept from the UI on success.
 */
export const useDeleteGeneratedConcept = (seedUuid: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (conceptUuid: string) => {
      if (!seedUuid) {
        throw new Error('Seed UUID is required');
      }
      if (!conceptUuid) {
        throw new Error('Concept UUID is required');
      }
      return await api.ideaPlayground.deleteGeneratedConcept(
        seedUuid,
        conceptUuid,
      );
    },
    onSuccess: (_, conceptUuid) => {
      telemetry.log('ideaPlayground.concept.deleted', {
        seedUuid,
        conceptUuid,
      });

      // Optimistically remove the concept from the cache immediately
      const currentData = queryClient.getQueryData<IConceptGenerationResponse>([
        AucctusQueryKeys.ideaPlaygroundGeneratedIdeas,
        seedUuid,
      ]);

      if (currentData && !('status' in currentData)) {
        queryClient.setQueryData<IConceptGenerationResponse>(
          [AucctusQueryKeys.ideaPlaygroundGeneratedIdeas, seedUuid],
          {
            ...currentData,
            concepts: currentData.concepts.filter(
              (c) => c.uuid !== conceptUuid,
            ),
          },
        );
      }
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to delete concept. Please try again.');
      telemetry.error('ideaPlayground.concept.delete.failed', e);
    },
  });

  return {
    deleteConcept: mutation.mutate,
    deleteConceptAsync: mutation.mutateAsync,
    isDeleting: mutation.isLoading,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

/**
 * Custom hook for generating additional concepts for a seed.
 * Triggers the "Generate More" feature which creates 4 new concepts different from existing ones.
 * Returns a mutation function for generating more concepts.
 */
export const useGenerateMoreConcepts = (seedUuid: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!seedUuid) {
        throw new Error('Seed UUID is required');
      }
      return await api.ideaPlayground.generateMoreIdeas(seedUuid);
    },
    onSuccess: () => {
      telemetry.log('ideaPlayground.generateMore.started', {
        seedUuid,
      });
      // Invalidate the GET query to update generatingMore status
      queryClient.invalidateQueries([
        AucctusQueryKeys.ideaPlaygroundGeneratedIdeas,
        seedUuid,
      ]);
    },
    onError: (e: AxiosError | Error) => {
      const message =
        'response' in e
          ? utils.osiris.parseFormError(e as AxiosError)
          : e.message;
      toast.error(message || 'Failed to generate more concepts.');
      telemetry.error('ideaPlayground.generateMore.failed', e);
    },
    retry: false,
  });

  return {
    generateMore: mutation.mutate,
    generateMoreAsync: mutation.mutateAsync,
    isLoading: mutation.isLoading,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

/**
 * Custom hook for regenerating concepts with user feedback.
 * Triggers a fresh concept generation using user feedback, replacing existing concepts.
 * Returns a mutation function for regenerating concepts with feedback.
 */
export const useRegenerateConceptsWithFeedback = (seedUuid: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (feedback: string) => {
      if (!seedUuid) {
        throw new Error('Seed UUID is required');
      }
      if (!feedback || feedback.trim().length === 0) {
        throw new Error('Feedback is required');
      }
      if (feedback.length > 1000) {
        throw new Error('Feedback must be 1000 characters or less');
      }
      return await api.ideaPlayground.regenerateIdeasWithFeedback(
        seedUuid,
        feedback.trim(),
      );
    },
    onSuccess: () => {
      telemetry.log('ideaPlayground.regenerateWithFeedback.started', {
        seedUuid,
      });
      // Invalidate the GET query to update generatingMore status
      queryClient.invalidateQueries([
        AucctusQueryKeys.ideaPlaygroundGeneratedIdeas,
        seedUuid,
      ]);
    },
    onError: (e: AxiosError | Error) => {
      const message =
        'response' in e
          ? utils.osiris.parseFormError(e as AxiosError)
          : e.message;
      toast.error(message || 'Failed to regenerate concepts with feedback.');
      telemetry.error('ideaPlayground.regenerateWithFeedback.failed', e);
    },
    retry: false,
  });

  return {
    regenerateWithFeedback: mutation.mutate,
    regenerateWithFeedbackAsync: mutation.mutateAsync,
    isLoading: mutation.isLoading,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

/**
 * Custom hook for saving selected concepts.
 * Returns a mutation function for persisting selected concepts as real concepts.
 */
export const useSaveConcepts = (seedUuid: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (conceptUuids: string[]) => {
      if (!seedUuid) {
        throw new Error('Seed UUID is required');
      }
      if (!conceptUuids || conceptUuids.length === 0) {
        throw new Error('At least one concept must be selected');
      }
      return await api.ideaPlayground.saveConcepts(seedUuid, conceptUuids);
    },
    onSuccess: (data, variables) => {
      toast.success(
        `Saved ${variables.length} concept${variables.length > 1 ? 's' : ''}`,
      );
      telemetry.log('ideaPlayground.concepts.saved', {
        count: variables.length,
        seedUuid,
      });
      // Invalidate concepts list
      queryClient.invalidateQueries([AucctusQueryKeys.concepts]);
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to save concepts. Please try again.');
      telemetry.error('ideaPlayground.concepts.save.failed', e);
    },
  });

  return {
    saveConcepts: mutation.mutate,
    saveConceptsAsync: mutation.mutateAsync,
    isSaving: mutation.isLoading,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

/**
 * Input type for adding a custom question
 */
interface IAddCustomQuestionInput {
  seedUuid: string;
  question: string;
  description?: string;
}

/**
 * Custom hook for adding a custom question to a seed.
 * After adding, the question type is resolved via LLM on the backend.
 * Returns the created question with a real UUID.
 */
export const useAddCustomQuestion = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: IAddCustomQuestionInput) => {
      if (!input.question?.trim()) {
        throw new Error('Question text is required');
      }
      if (input.question.length > 500) {
        throw new Error('Question must be 500 characters or less');
      }
      return await api.ideaPlayground.addCustomQuestion(
        input.seedUuid,
        input.question.trim(),
        input.description?.trim(),
      );
    },
    onSuccess: (data, input) => {
      telemetry.log('ideaPlayground.customQuestion.added', {
        seedUuid: input.seedUuid,
        questionUuid: data.uuid,
        questionLength: input.question.length,
      });
      // Invalidate questions query to refetch with new question
      queryClient.invalidateQueries([
        AucctusQueryKeys.ideaPlaygroundQuestions,
        input.seedUuid,
      ]);
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        message || 'Failed to add custom question. Please try again.',
      );
      telemetry.error('ideaPlayground.customQuestion.add.failed', e);
    },
  });

  return {
    addQuestion: mutation.mutate,
    addQuestionAsync: mutation.mutateAsync,
    isAdding: mutation.isLoading,
    addedQuestion: mutation.data,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};
