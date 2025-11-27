import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icon, toast } from '@components';
import type {
  IResearchInsight,
  Question,
  InsightCard as InsightCardType,
} from '../types';
import {
  getAnimationStyle,
  animationStyles,
} from '@components/Card/ConceptGeneration/UserExploration/components/util/animation-keyframes';
import QuestionCard from './QuestionCard';
import QuestionNavigationFooter from './QuestionNavigationFooter';
import { InsightDetailSidePanel } from '../Insights';
import {
  getSentimentColor,
  getSentimentIcon,
  getSentimentDescription,
  calculateCardPositions,
  generateCustomInsights,
} from './utils';
import useStore from '@stores/store';
import telemetry from '@libs/telemetry';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import {
  useQuestions,
  useRemoveUserAnswer,
} from '@hooks/query/ideaPlayground.hook';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import { PlaygroundLoadingIndicator } from '../PlaygroundLoadingIndicator';
import { isGenerationInProgress } from '@libs/api/ideaPlayground';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useMutation } from 'react-query';
import api from '@libs/api';
import { useDebouncedInvalidation } from '@hooks/query/useDebouncedInvalidation';
import type { IResearchInsight as IApiResearchInsight } from '@libs/api/types';
import { animated } from 'react-spring';
import { InsightCard } from '../Insights';

interface QuestionCarouselProps {
  topic: string;
  seedUuid: string | null;
  onGenerateIdeas?: () => void;
}

const QuestionCarousel: React.FC<QuestionCarouselProps> = ({
  seedUuid,
  onGenerateIdeas,
}) => {
  // Only use Zustand for UI state (carousel navigation)
  const { currentQuestionIndex, setCurrentQuestionIndex } = useStore(
    (state) => state.ideaPlayground,
  );

  // Debounced invalidation to prevent request storms
  const { debouncedInvalidate } = useDebouncedInvalidation();

  // Fetch questions using React Query - single source of truth
  const { questions: apiQuestions, isLoading: isLoadingQuestions } =
    useQuestions(seedUuid || undefined);

  // Sync selectedInsights with includedAnswers from API questions
  useEffect(() => {
    if (apiQuestions.length > 0) {
      const syncedSelections: Record<string, string[]> = {};
      apiQuestions.forEach((question) => {
        if (question.includedAnswers && question.includedAnswers.length > 0) {
          syncedSelections[question.uuid] = question.includedAnswers;
        }
      });
      setSelectedInsights(syncedSelections);
      telemetry.log('ideaPlayground.selections.synced', {
        questionCount: apiQuestions.length,
        selectionsCount: Object.keys(syncedSelections).length,
      });
    }
  }, [apiQuestions]);

  // Create a generic mutation for generating insights (works for any question)
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

      const message = utils.osiris.parseFormError(error);
      toast.error(
        message || 'Failed to generate research insights. Please try again.',
      );
      telemetry.error('ideaPlayground.insights.generate.failed', error);
    },
  });

  // Mutation for generating possible answer (AI suggestion)
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

      // Invalidate questions query to refetch with new possible answer
      debouncedInvalidate([
        AucctusQueryKeys.ideaPlaygroundQuestions,
        variables.seedUuid,
      ]);
      telemetry.log('ideaPlayground.possibleAnswer.generated', {
        questionUuid: variables.questionUuid,
      });
    },
    onError: (error: AxiosError, variables) => {
      // Remove loading state on error
      removeLoadingOperation(variables.questionUuid, 'possibleAnswer');

      const message = utils.osiris.parseFormError(error);
      toast.error(
        message || 'Failed to generate answer suggestion. Please try again.',
      );
      telemetry.error('ideaPlayground.possibleAnswer.generate.failed', error);
    },
  });

  // User answer removal hook
  const { removeAnswerAsync } = useRemoveUserAnswer();

  // Local state (currentQuestionIndex is now in Zustand store)
  const [manualAnswerOpen, setManualAnswerOpen] = useState<
    Record<string, boolean>
  >({});
  const [selectedInsights, setSelectedInsights] = useState<
    Record<string, string[]>
  >({});
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [selectedInsightForDetails, setSelectedInsightForDetails] =
    useState<InsightCardType | null>(null);
  const [customQuestionInput, setCustomQuestionInput] = useState<
    Record<string, string>
  >({});
  const [customInsights, setCustomInsights] = useState<
    Record<string, InsightCardType[]>
  >({});

  // Track loading operations per question using Sets for better state management
  type LoadingOperation = 'insights' | 'possibleAnswer';
  const [loadingOperations, setLoadingOperations] = useState<
    Record<string, Set<LoadingOperation>>
  >({});

  // Helper functions to manage loading operations
  const addLoadingOperation = useCallback(
    (questionId: string, operation: LoadingOperation) => {
      setLoadingOperations((prev) => {
        const newOps = { ...prev };
        if (!newOps[questionId]) {
          newOps[questionId] = new Set();
        } else {
          newOps[questionId] = new Set(newOps[questionId]);
        }
        newOps[questionId].add(operation);
        return newOps;
      });
    },
    [],
  );

  const removeLoadingOperation = useCallback(
    (questionId: string, operation: LoadingOperation) => {
      setLoadingOperations((prev) => {
        const newOps = { ...prev };
        if (newOps[questionId]) {
          newOps[questionId] = new Set(newOps[questionId]);
          newOps[questionId].delete(operation);
          // Clean up empty sets
          if (newOps[questionId].size === 0) {
            delete newOps[questionId];
          }
        }
        return newOps;
      });
    },
    [],
  );

  // Track previous card IDs for smooth animations
  const prevCardIdsRef = useRef<Set<string>>(new Set());

  // Refs for precise positioning calculations
  const leftNavRef = useRef<HTMLButtonElement>(null);
  const rightNavRef = useRef<HTMLButtonElement>(null);
  const questionCardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track element rects for precise positioning
  const [elementRects, setElementRects] = useState<{
    leftNav?: DOMRect;
    rightNav?: DOMRect;
    questionCard?: DOMRect;
    container?: DOMRect;
  }>({});

  // Update element rects
  const updateRects = useCallback(() => {
    if (
      leftNavRef.current &&
      rightNavRef.current &&
      questionCardRef.current &&
      containerRef.current
    ) {
      setElementRects({
        leftNav: leftNavRef.current.getBoundingClientRect(),
        rightNav: rightNavRef.current.getBoundingClientRect(),
        questionCard: questionCardRef.current.getBoundingClientRect(),
        container: containerRef.current.getBoundingClientRect(),
      });
    }
  }, []);

  // Update rects on mount and when question changes
  useEffect(() => {
    // Small delay to ensure DOM is rendered
    const timer = setTimeout(updateRects, 0);
    return () => clearTimeout(timer);
  }, [currentQuestionIndex, updateRects]);

  // Handle window resize for card repositioning
  useEffect(() => {
    const handleResize = () => {
      updateRects();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        telemetry.log('ideaPlayground.insight.validation_failed.websocket', {
          insightUuid: data.insightUuid,
          error: data.errorMessage,
        });
        toast.warning('Citation validation failed for one insight');
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
        const targetQuestionId = questionUuid || currentQuestion?.id;

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

  // Inject keyframe animations
  useEffect(() => {
    const styleId = 'carousel-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = animationStyles;
      document.head.appendChild(style);
    }
  }, []);

  // Helper function to convert IResearchInsight to InsightCard format
  const convertInsightToCard = (
    insight: IResearchInsight,
  ): InsightCardType => ({
    id: insight.uuid,
    insight: insight.insight,
    source: insight?.sourceTitle || insight?.sourceUrl || 'nucleus',
    url: insight?.sourceUrl || '',
    type: 'opportunity' as any,
    sentiment: insight.sentiment,
    moreDetails: insight.moreDetails,
    whyItMatters: insight.whyItMatters,
  });

  // Convert API questions to legacy format for existing UI
  const apiQuestionsConverted: Question[] = apiQuestions.map((q) => ({
    id: q.uuid,
    question: q.question,
    explanation: q.description,
    label: q.questionType,
  }));

  const questions = [...apiQuestionsConverted, ...customQuestions];
  const currentQuestion = questions[currentQuestionIndex];

  // Get insights for current question from API and store, convert to card format
  const currentApiQuestion = apiQuestions.find(
    (q) => q.uuid === currentQuestion?.id,
  );

  // Get research insights from React Query data
  const apiInsights = currentApiQuestion?.insights
    ? currentApiQuestion.insights.map(convertInsightToCard)
    : [];

  const currentInsights = currentQuestion
    ? [...apiInsights, ...(customInsights[currentQuestion.id] || [])]
    : [];

  // Reset card tracking and manual answer state when navigating to a different question
  useEffect(() => {
    prevCardIdsRef.current.clear();
    // Clear manual answer open state for all questions except the current one
    setManualAnswerOpen((prev) => {
      if (!currentQuestion?.id) return {};
      // Only keep the current question's state if it exists
      return currentQuestion.id in prev
        ? { [currentQuestion.id]: prev[currentQuestion.id] }
        : {};
    });
  }, [currentQuestion?.id]);

  // Auto-fetch data for ALL questions as soon as they're available
  useEffect(() => {
    if (!seedUuid || apiQuestions.length === 0) return;

    // Trigger generation for all non-custom questions that don't have data yet
    apiQuestions.forEach((question) => {
      const questionId = question.uuid;

      // Get data from React Query (single source of truth)
      const hasInsights =
        question.researchInsights && question.researchInsights.length > 0;
      const hasPossibleAnswer =
        question.possibleAnswers && question.possibleAnswers.length > 0;

      // Check if operations are already loading
      const currentOps = loadingOperations[questionId];
      const isLoadingInsights = currentOps?.has('insights');
      const isLoadingPossibleAnswer = currentOps?.has('possibleAnswer');

      // Auto-fetch insights if not cached and not already loading
      if (!hasInsights && !isLoadingInsights) {
        addLoadingOperation(questionId, 'insights');
        generateInsightsMutation.mutate({
          seedUuid: seedUuid,
          questionUuid: questionId,
        });
      }

      // Auto-fetch possible answer if not cached and not already loading
      if (!hasPossibleAnswer && !isLoadingPossibleAnswer) {
        addLoadingOperation(questionId, 'possibleAnswer');
        generatePossibleAnswerMutation.mutate({
          seedUuid: seedUuid,
          questionUuid: questionId,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Helper functions (addLoadingOperation, removeLoadingOperation) and mutations are stable; loadingOperations intentionally excluded to avoid re-triggering on state changes
  }, [seedUuid, apiQuestions.length]);

  // Side menu now handles its own animations internally

  const handleNext = () => {
    setCurrentQuestionIndex((currentQuestionIndex + 1) % questions.length);
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex(
      (currentQuestionIndex - 1 + questions.length) % questions.length,
    );
  };

  const handleQuestionClick = (questionId: string) => {
    // Open manual answer card if it's not already open
    if (!manualAnswerOpen[questionId]) {
      setManualAnswerOpen((prev) => ({ ...prev, [questionId]: true }));
    }

    // No need to generate insights/answers here - they're already being generated
    // for all questions in the useEffect above
  };

  const handleSubmitAnswer = async (
    questionId: string,
    answer: string,
  ): Promise<void> => {
    if (!seedUuid || !answer.trim()) return;

    try {
      await api.ideaPlayground.addUserAnswer(
        seedUuid,
        questionId,
        answer.trim(),
      );

      // Invalidate questions query to refetch with new user answer
      debouncedInvalidate([AucctusQueryKeys.ideaPlaygroundQuestions, seedUuid]);

      telemetry.log('ideaPlayground.userAnswer.submitted', {
        questionUuid: questionId,
        answerLength: answer.trim().length,
      });
    } catch (error) {
      telemetry.error('ideaPlayground.userAnswer.submit.failed', error);
      toast.error('Failed to save your answer. Please try again.');
      throw error; // Re-throw so ManualAnswer knows submission failed
    }
  };

  const handleSelectionChange = (
    questionId: string,
    cardId: string,
    isSelected: boolean,
  ) => {
    // Use functional form to avoid race conditions when multiple cards update simultaneously
    setSelectedInsights((prev) => {
      const currentSelections = prev[questionId] || [];

      // Check if the card is already in the desired state to avoid unnecessary updates
      const isCurrentlySelected = currentSelections.includes(cardId);
      if (isCurrentlySelected === isSelected) {
        // Already in correct state, no update needed
        return prev;
      }

      const updatedSelections = isSelected
        ? [...currentSelections, cardId]
        : currentSelections.filter((id) => id !== cardId);

      return {
        ...prev,
        [questionId]: updatedSelections,
      };
    });
  };

  const handleInsightDoubleClick = (insight: InsightCardType) => {
    setSelectedInsightForDetails(insight);
    setSideMenuOpen(true);
  };

  const handleUserAnswerDelete = async (questionId: string, card: any) => {
    if (!seedUuid) return;

    // If it's a saved user answer, delete it via API
    if (card.isSaved && card.userAnswerUuid) {
      await removeAnswerAsync({
        seedUuid: seedUuid,
        questionUuid: questionId,
      });
    }
  };

  const isQuestionAnswered = (questionId: string) => {
    // Check if question has any included answers from API
    const question = apiQuestions.find((q) => q.uuid === questionId);
    const hasIncludedAnswers =
      question?.includedAnswers && question.includedAnswers.length > 0;

    // Check if question has a user answer
    const hasUserAnswer =
      question?.userAnswer !== undefined && question?.userAnswer !== null;

    // Also check local state for immediate feedback
    const hasSelectedInsights = (selectedInsights[questionId] || []).length > 0;

    return hasIncludedAnswers || hasUserAnswer || hasSelectedInsights;
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `custom-${Date.now()}`,
      question: '',
      explanation: 'Describe something to consider about this topic',
      label: 'Custom',
      answer: '',
    };
    setCustomQuestions((prev) => [...prev, newQuestion]);
    setCurrentQuestionIndex(questions.length);
    setCustomQuestionInput((prev) => ({ ...prev, [newQuestion.id]: '' }));
  };

  const handleRemoveQuestion = (questionIndex: number, questionId: string) => {
    if (!questionId.startsWith('custom-')) return;

    setCustomQuestions((prev) => prev.filter((q) => q.id !== questionId));

    if (currentQuestionIndex >= questionIndex && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentQuestionIndex >= questions.length - 1) {
      setCurrentQuestionIndex(Math.max(0, questions.length - 2));
    }

    setSelectedInsights((prev) => {
      const newInsights = { ...prev };
      delete newInsights[questionId];
      return newInsights;
    });

    setCustomQuestionInput((prev) => {
      const newInput = { ...prev };
      delete newInput[questionId];
      return newInput;
    });

    setCustomInsights((prev) => {
      const newInsights = { ...prev };
      delete newInsights[questionId];
      return newInsights;
    });

    setManualAnswerOpen((prev) => {
      const newManualAnswerOpen = { ...prev };
      delete newManualAnswerOpen[questionId];
      return newManualAnswerOpen;
    });
  };

  const handleCustomQuestionSubmit = (questionId: string) => {
    const input = customQuestionInput[questionId];
    if (!input?.trim()) return;

    setCustomQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, question: input.trim() } : q,
      ),
    );

    const generatedInsights = generateCustomInsights(questionId, input);

    setCustomInsights((prev) => ({
      ...prev,
      [questionId]: generatedInsights,
    }));
  };

  // Utility functions moved to utils.tsx and imported above

  // Compute loading state and message for current question
  const currentQuestionLoadingState = React.useMemo(() => {
    if (!currentQuestion?.id) {
      return { isLoading: false, message: '' };
    }

    const operations = loadingOperations[currentQuestion.id];
    if (!operations || operations.size === 0) {
      return { isLoading: false, message: '' };
    }

    const hasInsights = operations.has('insights');
    const hasPossibleAnswer = operations.has('possibleAnswer');

    if (hasInsights && hasPossibleAnswer) {
      return {
        isLoading: true,
        message: 'Generating insights and suggestions...',
      };
    } else if (hasInsights) {
      return { isLoading: true, message: 'Researching insights...' };
    } else if (hasPossibleAnswer) {
      return { isLoading: true, message: 'Generating answer suggestion...' };
    }

    return { isLoading: false, message: '' };
  }, [currentQuestion?.id, loadingOperations]);

  // Check if a user answer card is actually rendered on screen
  const hasUserAnswerOnScreen = React.useMemo(() => {
    if (!currentQuestion?.id) return false;

    // A manual answer card is rendered when:
    // 1. There's a saved user answer, OR
    // 2. The manual answer input is open
    const currentApiQuestion = apiQuestions.find(
      (q) => q.uuid === currentQuestion.id,
    );
    const hasSavedAnswer = !!currentApiQuestion?.userAnswer;
    const hasOpenInput = manualAnswerOpen[currentQuestion.id];

    return hasSavedAnswer || hasOpenInput;
  }, [currentQuestion?.id, apiQuestions, manualAnswerOpen]);

  const renderFloatingInsights = () => {
    // Build limited insights array: nucleus first (if exists), then non-nucleus up to 3 more
    const limitedInsights = currentInsights.slice(0, 5);

    const allCards = [...limitedInsights];

    // Add possible answer cards if available (now supports multiple)
    const currentApiQuestion = apiQuestions.find(
      (q) => q.uuid === currentQuestion.id,
    );
    if (
      currentApiQuestion?.possibleAnswers &&
      !currentQuestion.id.startsWith('custom-')
    ) {
      currentApiQuestion.possibleAnswers.forEach((possibleAnswer) => {
        allCards.push({
          id: possibleAnswer.uuid,
          insight: possibleAnswer.answer,
          source: 'Possible Answer',
          type: 'data' as any,
          sentiment: 'neutral' as any,
          isManual: false,
          moreDetails: null,
          whyItMatters: null,
        } as any);
      });
    }

    // Use a stable ID for both input and saved states to prevent re-animation
    const manualAnswerCardId = `manual-answer-${currentQuestion.id}`;

    // Add the saved user answer if it exists
    if (
      currentApiQuestion?.userAnswer &&
      !currentQuestion.id.startsWith('custom-')
    ) {
      allCards.push({
        id: manualAnswerCardId, // Use stable ID instead of UUID
        insight: currentApiQuestion.userAnswer.answer,
        source: 'User Answer',
        type: 'manual' as any,
        sentiment: 'neutral' as any,
        isManual: true,
        isSaved: true, // Mark as saved to trigger API delete
        userAnswerUuid: currentApiQuestion.userAnswer.uuid, // Store UUID for deletion
      } as any);
    }

    // Add manual answer input card only if no saved answer exists and it's been opened
    if (
      !currentApiQuestion?.userAnswer &&
      manualAnswerOpen[currentQuestion.id] &&
      !currentQuestion.id.startsWith('custom-')
    ) {
      allCards.push({
        id: manualAnswerCardId, // Use stable ID
        source: { url: '', title: 'manual', credibility: 0 },
        type: 'manual' as any,
        sentiment: 'neutral' as any,
        isManual: true,
      } as any);
    }

    // Identify new cards vs existing cards for animation purposes
    const newCardIds = allCards
      .filter((card) => !prevCardIdsRef.current.has(card.id))
      .map((c) => c.id);

    // Update ref with current card IDs for next render
    prevCardIdsRef.current = new Set(allCards.map((c) => c.id));

    const transitionDuration = 400; // ms for existing cards to move

    return allCards.map((card, index) => {
      const { x, y } = calculateCardPositions(
        allCards.length,
        index,
        elementRects,
      );
      const isNewCard = newCardIds.includes(card.id);
      const entranceDelay = isNewCard ? transitionDuration + 50 : 0;

      return (
        <div
          key={card.id}
          className='pointer-events-auto absolute z-10'
          style={{
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
            transform: 'translate(-50%, -50%)',
            transition: isNewCard
              ? undefined
              : 'left 400ms ease-out, top 400ms ease-out',
          }}
        >
          <animated.div
            style={
              {
                opacity: 0,
                transform: `translate(${-x}px, ${-y}px) scale(0.5)`,
                animation: `fadeSlideToPosition 300ms ease-out ${entranceDelay}ms forwards, float ${2.5 + (index % 3) * 0.5}s ease-in-out ${entranceDelay + 300}ms infinite`,
                '--slide-x': `${-x}px`,
                '--slide-y': `${-y}px`,
              } as React.CSSProperties
            }
          >
            <InsightCard
              card={card}
              isSelected={(selectedInsights[currentQuestion.id] || []).includes(
                card.id,
              )}
              seedUuid={seedUuid || ''}
              questionUuid={currentQuestion.id}
              answer={card.insight}
              getSentimentColor={getSentimentColor}
              getSentimentIcon={getSentimentIcon}
              getSentimentDescription={getSentimentDescription}
              onSelectionChange={(cardId, isSelected) =>
                handleSelectionChange(currentQuestion.id, cardId, isSelected)
              }
              onDoubleClick={() => handleInsightDoubleClick(card)}
              onDelete={() => handleUserAnswerDelete(currentQuestion.id, card)}
              onSubmit={(answer) =>
                handleSubmitAnswer(currentQuestion.id, answer)
              }
              onAnimationComplete={() =>
                setManualAnswerOpen((prev) => ({
                  ...prev,
                  [currentQuestion.id]: false,
                }))
              }
            />
          </animated.div>
        </div>
      );
    });
  };

  // Always render loading indicator - it manages its own enter/exit animations
  return (
    <>
      {!isLoadingQuestions && !currentQuestion && (
        <div className='flex h-full w-full items-center justify-center'>
          <div className='aucctus-text-secondary aucctus-text-lg'>
            No questions available
          </div>
        </div>
      )}

      <div className='relative flex h-full w-full flex-col'>
        {/* Carousel Container */}
        <div
          ref={containerRef}
          className='relative flex flex-1 items-center justify-center pb-20'
        >
          {/* Global loading indicator for initial questions generation - centered in carousel */}
          <PlaygroundLoadingIndicator
            show={isLoadingQuestions}
            message='Generating innovation questions...'
            className='pointer-events-none absolute inset-0 z-[9999] flex items-center justify-center'
            usePortal={false}
          />

          {/* Loading indicator for current question operations - bottom-left of carousel */}
          <PlaygroundLoadingIndicator
            show={currentQuestionLoadingState.isLoading}
            message={currentQuestionLoadingState.message}
            className='pointer-events-none absolute left-10 top-5 z-[9999]'
            usePortal={false}
          />

          {!isLoadingQuestions && currentQuestion && (
            <>
              {/* Navigation Arrows */}
              <button
                ref={leftNavRef}
                onClick={handlePrevious}
                className='aucctus-text-white absolute left-8 z-10 rounded-lg border border-white/30 bg-white/30 backdrop-blur-md transition-all duration-100 hover:scale-110 active:scale-90'
              >
                <Icon
                  variant='chevronleft'
                  className='aucctus-stroke-white mx-4 my-2'
                  height={26}
                  width={26}
                />
              </button>

              <button
                ref={rightNavRef}
                onClick={handleNext}
                className='aucctus-text-white absolute right-8 z-10 rounded-lg border border-white/30 bg-white/30 backdrop-blur-md transition-all duration-100 hover:scale-110 active:scale-90'
              >
                <Icon
                  variant='chevronright'
                  className='aucctus-stroke-white mx-4 my-2'
                  height={26}
                  width={26}
                />
              </button>

              {/* Question Card with Floating Insights */}
              <div className='relative'>
                <div
                  ref={questionCardRef}
                  key={currentQuestion.id}
                  className='relative z-10 mx-auto w-full max-w-lg px-16'
                  style={getAnimationStyle('fadeIn', 300, 0)}
                >
                  <QuestionCard
                    question={currentQuestion}
                    isAnswered={isQuestionAnswered(currentQuestion.id)}
                    hasUserAnswer={hasUserAnswerOnScreen}
                    customQuestionInput={
                      customQuestionInput[currentQuestion.id]
                    }
                    onQuestionClick={() =>
                      handleQuestionClick(currentQuestion.id)
                    }
                    onCustomQuestionInputChange={(value) =>
                      setCustomQuestionInput((prev) => ({
                        ...prev,
                        [currentQuestion.id]: value,
                      }))
                    }
                    onCustomQuestionSubmit={() =>
                      handleCustomQuestionSubmit(currentQuestion.id)
                    }
                  />
                </div>

                {/* Floating Insight Cards */}
                <div className='pointer-events-none absolute inset-0'>
                  {renderFloatingInsights()}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Navigation Footer */}
        {!isLoadingQuestions && currentQuestion && (
          <QuestionNavigationFooter
            questions={questions}
            currentIndex={currentQuestionIndex}
            isQuestionAnswered={isQuestionAnswered}
            onQuestionSelect={setCurrentQuestionIndex}
            onAddQuestion={handleAddQuestion}
            onRemoveQuestion={handleRemoveQuestion}
            onGenerateIdeas={onGenerateIdeas}
          />
        )}

        {/* Side Menu for Insight Details */}
        {!isLoadingQuestions && currentQuestion && (
          <InsightDetailSidePanel
            selectedInsight={selectedInsightForDetails}
            isOpen={sideMenuOpen}
            getSentimentIcon={getSentimentIcon}
            onClose={() => setSideMenuOpen(false)}
            onAddRelatedInsight={(newInsight) => {
              setCustomInsights((prev) => ({
                ...prev,
                [currentQuestion.id]: [
                  ...(prev[currentQuestion.id] || currentInsights),
                  newInsight,
                ],
              }));
            }}
          />
        )}
      </div>
    </>
  );
};

export default QuestionCarousel;
