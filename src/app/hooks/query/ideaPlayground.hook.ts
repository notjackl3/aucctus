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
import type { IResearchInsight, IPossibleAnswer } from '@libs/api/types';

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
 * Custom hook for creating a seed with an anchor thought.
 * Returns a mutation function for creating a new idea playground session.
 */
export const useCreateSeed = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (thoughtText: string) => {
      if (!thoughtText?.trim()) {
        throw new Error('Thought text is required');
      }
      return await api.ideaPlayground.createSeedWithThought(thoughtText);
    },
    onSuccess: (data) => {
      telemetry.log('ideaPlayground.seed.created', {
        seedUuid: data.seedUuid,
        thoughtLength: data.anchorThought.thought.length,
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
 * Custom hook for generating a possible answer for a question.
 * Returns a mutation function for AI-generated answer suggestions.
 * Handles 202 Accepted responses with WebSocket notifications and 1-minute polling fallback.
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
      return response as IPossibleAnswer;
    },
    onSuccess: () => {
      telemetry.log('ideaPlayground.possibleAnswer.generated', {
        questionUuid,
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
    possibleAnswer: mutation.data,
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
    onSuccess: () => {
      toast.success('Answer saved');
      telemetry.log('ideaPlayground.userAnswer.saved', {
        questionUuid,
      });
      // Invalidate questions to refresh included_answers list
      queryClient.invalidateQueries([
        AucctusQueryKeys.ideaPlaygroundQuestions,
        seedUuid,
      ]);
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to save answer. Please try again.');
      telemetry.error('ideaPlayground.userAnswer.save.failed', e);
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
 * Custom hook for removing the user's answer from a question entirely.
 * Deletes the single user answer for the question.
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
    }: {
      seedUuid: string;
      questionUuid: string;
    }) => {
      if (!seedUuid || !questionUuid) {
        throw new Error('Seed UUID and Question UUID are required');
      }
      return await api.ideaPlayground.removeUserAnswer(seedUuid, questionUuid);
    },
    onSuccess: (_, { seedUuid, questionUuid }) => {
      telemetry.log('ideaPlayground.userAnswer.removed', {
        questionUuid,
      });
      // Invalidate questions to refresh userAnswer field
      queryClient.invalidateQueries([
        AucctusQueryKeys.ideaPlaygroundQuestions,
        seedUuid,
      ]);
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to remove answer. Please try again.');
      telemetry.error('ideaPlayground.userAnswer.remove.failed', e);
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

  return {
    ...query,
    generatedIdeasResponse: query.data,
    isGenerating,
    hasConcepts,
    concepts:
      query.data && !isGenerationInProgress(query.data)
        ? query.data.concepts
        : [],
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
