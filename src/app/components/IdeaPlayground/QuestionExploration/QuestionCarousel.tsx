import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { Icon, toast } from '@components';
import Modal from '@components/Modal';
import { useModal } from '@context/ModalContextProvider';
import type { IActionButton } from '@components/Modal/ConfirmationModal/ConfirmationModal';
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
import FloatingInsights from './FloatingInsights';
import { InsightDetailSidePanel } from '../Insights';
import useStore from '@stores/store';
import telemetry from '@libs/telemetry';
import {
  useQuestions,
  useRemoveUserAnswer,
  useAddCustomQuestion,
  useDeleteCustomQuestion,
} from '@hooks/query/ideaPlayground.hook';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import { PlaygroundLoadingIndicator } from '../PlaygroundLoadingIndicator';
import api from '@libs/api';
import { useDebouncedInvalidation } from '@hooks/query/useDebouncedInvalidation';
import {
  useGenerationMutations,
  useWebSocketSync,
  useBulkQuestionsUpdate,
} from './hooks';
import { getSentimentIcon } from './utils';

interface QuestionCarouselProps {
  topic: string;
  seedUuid: string | null;
  onGenerateIdeas?: () => void;
  onViewConcepts?: () => void;
  hasGeneratedConcepts?: boolean;
}

// Type for loading operations
type LoadingOperation = 'insights' | 'possibleAnswer';

const QuestionCarousel: React.FC<QuestionCarouselProps> = ({
  seedUuid,
  onGenerateIdeas,
  onViewConcepts,
  hasGeneratedConcepts = false,
}) => {
  // Zustand store for UI state
  const {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    clearSelectedConcepts,
  } = useStore((state) => state.ideaPlayground);

  // Debounced invalidation to prevent request storms
  const { debouncedInvalidate } = useDebouncedInvalidation();

  // Fetch questions using React Query
  const { questions: apiQuestions, isLoading: isLoadingQuestions } =
    useQuestions(seedUuid || undefined);

  // Local state
  const [selectedInsights, setSelectedInsights] = useState<
    Record<string, string[]>
  >({});
  const [inputsAtGeneration, setInputsAtGeneration] = useState<Record<
    string,
    string[]
  > | null>(null);
  const [questionsSnapshotAtGeneration, setQuestionsSnapshotAtGeneration] =
    useState<typeof apiQuestions | null>(null);
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [submittingQuestionId, setSubmittingQuestionId] = useState<
    string | null
  >(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(
    null,
  );
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [selectedInsightForDetails, setSelectedInsightForDetails] =
    useState<InsightCardType | null>(null);
  const [customQuestionInput, setCustomQuestionInput] = useState<
    Record<string, string>
  >({});
  const [customInsights, setCustomInsights] = useState<
    Record<string, InsightCardType[]>
  >({});
  const [loadingOperations, setLoadingOperations] = useState<
    Record<string, Set<LoadingOperation>>
  >({});
  const [userInputValue, setUserInputValue] = useState<Record<string, string>>(
    {},
  );
  const [isSubmittingUserInput, setIsSubmittingUserInput] = useState(false);

  // Modal context
  const { openModal, closeModal } = useModal();

  // Refs for positioning
  const leftNavRef = useRef<HTMLButtonElement>(null);
  const rightNavRef = useRef<HTMLButtonElement>(null);
  const questionCardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [elementRects, setElementRects] = useState<{
    leftNav?: DOMRect;
    rightNav?: DOMRect;
    questionCard?: DOMRect;
    container?: DOMRect;
  }>({});

  // API hooks
  const { removeAnswerAsync } = useRemoveUserAnswer();
  const { addQuestionAsync } = useAddCustomQuestion();
  const { deleteQuestionAsync } = useDeleteCustomQuestion();

  // Helper functions for loading operations
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
          if (newOps[questionId].size === 0) {
            delete newOps[questionId];
          }
        }
        return newOps;
      });
    },
    [],
  );

  // Custom hooks
  const { generateInsightsMutation, generatePossibleAnswerMutation } =
    useGenerationMutations({
      removeLoadingOperation,
    });

  // Convert API questions to Question format
  const apiQuestionsConverted: Question[] = useMemo(
    () =>
      apiQuestions.map((q) => ({
        id: q.uuid,
        question: q.question,
        explanation: q.description,
        label: q.questionType,
        isCustomQuestion: q.isCustomQuestion ?? false,
      })),
    [apiQuestions],
  );

  const questions = useMemo(
    () => [...apiQuestionsConverted, ...customQuestions],
    [apiQuestionsConverted, customQuestions],
  );

  const currentQuestion = questions[currentQuestionIndex];

  // WebSocket sync
  useWebSocketSync({
    seedUuid,
    currentQuestionId: currentQuestion?.id,
    addLoadingOperation,
    removeLoadingOperation,
  });

  // Bulk update hook for revert functionality
  const { revertToGenerationState } = useBulkQuestionsUpdate({
    seedUuid,
    inputsAtGeneration,
    questionsSnapshotAtGeneration,
    setSelectedInsights,
  });

  // Derived state
  const hasSnapshotCaptured = inputsAtGeneration !== null;

  const hasInputsChangedSinceGeneration = useMemo(() => {
    if (
      !hasGeneratedConcepts ||
      !hasSnapshotCaptured ||
      inputsAtGeneration === null
    )
      return false;

    const currentKeys = Object.keys(selectedInsights);
    const snapshotKeys = Object.keys(inputsAtGeneration);

    if (currentKeys.length !== snapshotKeys.length) return true;

    for (const questionId of currentKeys) {
      const currentSelections = selectedInsights[questionId] || [];
      const snapshotSelections = inputsAtGeneration[questionId] || [];

      if (currentSelections.length !== snapshotSelections.length) return true;

      const sortedCurrent = [...currentSelections].sort();
      const sortedSnapshot = [...snapshotSelections].sort();
      for (let i = 0; i < sortedCurrent.length; i++) {
        if (sortedCurrent[i] !== sortedSnapshot[i]) return true;
      }
    }

    for (const questionId of snapshotKeys) {
      if (!currentKeys.includes(questionId)) return true;
    }

    return false;
  }, [
    hasGeneratedConcepts,
    hasSnapshotCaptured,
    selectedInsights,
    inputsAtGeneration,
  ]);

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
    citationValidationStatus: insight.citationValidationStatus,
  });

  // Get current question's insights
  const currentApiQuestion = apiQuestions.find(
    (q) => q.uuid === currentQuestion?.id,
  );
  const apiInsights = currentApiQuestion?.insights
    ? currentApiQuestion.insights.map(convertInsightToCard)
    : [];
  const currentInsights = currentQuestion
    ? [...apiInsights, ...(customInsights[currentQuestion.id] || [])]
    : [];

  // Update element rects for positioning
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

  // Effects
  useEffect(() => {
    const timer = setTimeout(updateRects, 0);
    return () => clearTimeout(timer);
  }, [currentQuestionIndex, updateRects]);

  useEffect(() => {
    window.addEventListener('resize', updateRects);
    return () => window.removeEventListener('resize', updateRects);
  }, [updateRects]);

  useEffect(() => {
    const styleId = 'carousel-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = animationStyles;
      document.head.appendChild(style);
    }
  }, []);

  // Sync selectedInsights with API data
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

  // Initialize snapshot when restoring session with existing concepts
  useEffect(() => {
    if (
      hasGeneratedConcepts &&
      !hasSnapshotCaptured &&
      apiQuestions.length > 0
    ) {
      setInputsAtGeneration({ ...selectedInsights });
      setQuestionsSnapshotAtGeneration([...apiQuestions]);
    }
  }, [
    hasGeneratedConcepts,
    hasSnapshotCaptured,
    selectedInsights,
    apiQuestions,
  ]);

  // Auto-fetch data for all questions
  useEffect(() => {
    if (!seedUuid || apiQuestions.length === 0) return;

    apiQuestions.forEach((question) => {
      const questionId = question.uuid;
      const hasInsights =
        question.researchInsights && question.researchInsights.length > 0;
      const hasPossibleAnswer =
        question.possibleAnswers && question.possibleAnswers.length > 0;
      const currentOps = loadingOperations[questionId];
      const isLoadingInsights = currentOps?.has('insights');
      const isLoadingPossibleAnswer = currentOps?.has('possibleAnswer');

      if (!hasInsights && !isLoadingInsights) {
        addLoadingOperation(questionId, 'insights');
        generateInsightsMutation.mutate({ seedUuid, questionUuid: questionId });
      }

      if (!hasPossibleAnswer && !isLoadingPossibleAnswer) {
        addLoadingOperation(questionId, 'possibleAnswer');
        generatePossibleAnswerMutation.mutate({
          seedUuid,
          questionUuid: questionId,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedUuid, apiQuestions.length]);

  // Event handlers
  const discardUnsavedCustomQuestion = useCallback(() => {
    const currentQ = questions[currentQuestionIndex];
    if (currentQ?.id.startsWith('custom-') && !currentQ.question) {
      setCustomQuestions((prev) => prev.filter((q) => q.id !== currentQ.id));
      setCustomQuestionInput((prev) => {
        const newInput = { ...prev };
        delete newInput[currentQ.id];
        return newInput;
      });
      return true;
    }
    return false;
  }, [questions, currentQuestionIndex]);

  const handleNext = () => {
    discardUnsavedCustomQuestion();
    setCurrentQuestionIndex((currentQuestionIndex + 1) % questions.length);
  };

  const handlePrevious = () => {
    discardUnsavedCustomQuestion();
    setCurrentQuestionIndex(
      (currentQuestionIndex - 1 + questions.length) % questions.length,
    );
  };

  const handleQuestionSelect = useCallback(
    (index: number) => {
      if (index === currentQuestionIndex) return;
      discardUnsavedCustomQuestion();
      setCurrentQuestionIndex(index);
    },
    [
      currentQuestionIndex,
      discardUnsavedCustomQuestion,
      setCurrentQuestionIndex,
    ],
  );

  const handleUserInputSubmit = async () => {
    if (!seedUuid || !currentQuestion?.id) return;

    const inputValue = userInputValue[currentQuestion.id];
    if (!inputValue?.trim()) return;

    setIsSubmittingUserInput(true);
    try {
      await api.ideaPlayground.addUserAnswer(
        seedUuid,
        currentQuestion.id,
        inputValue.trim(),
      );
      debouncedInvalidate([AucctusQueryKeys.ideaPlaygroundQuestions, seedUuid]);
      // Clear the input after successful submission
      setUserInputValue((prev) => {
        const newInput = { ...prev };
        delete newInput[currentQuestion.id];
        return newInput;
      });
      telemetry.log('ideaPlayground.userAnswer.submitted', {
        questionUuid: currentQuestion.id,
        answerLength: inputValue.trim().length,
      });
    } catch (error) {
      telemetry.error('ideaPlayground.userAnswer.submit.failed', error);
      toast.error('Failed to save your answer. Please try again.');
    } finally {
      setIsSubmittingUserInput(false);
    }
  };

  const handleSelectionChange = (
    questionId: string,
    cardId: string,
    isSelected: boolean,
  ) => {
    setSelectedInsights((prev) => {
      const currentSelections = prev[questionId] || [];
      const isCurrentlySelected = currentSelections.includes(cardId);
      if (isCurrentlySelected === isSelected) return prev;

      const updatedSelections = isSelected
        ? [...currentSelections, cardId]
        : currentSelections.filter((id) => id !== cardId);

      return { ...prev, [questionId]: updatedSelections };
    });
  };

  const handleInsightDoubleClick = (insight: InsightCardType) => {
    setSelectedInsightForDetails(insight);
    setSideMenuOpen(true);
  };

  const handleUserAnswerDelete = async (questionId: string, card: any) => {
    if (!seedUuid) return;
    if (card.isSaved && card.userAnswerUuid) {
      await removeAnswerAsync({ seedUuid, questionUuid: questionId });
    }
  };

  const isQuestionAnswered = (questionId: string) => {
    const question = apiQuestions.find((q) => q.uuid === questionId);
    const hasIncludedAnswers =
      question?.includedAnswers && question.includedAnswers.length > 0;
    const hasUserAnswer =
      question?.userAnswer !== undefined && question?.userAnswer !== null;
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

  const handleRemoveQuestion = async (
    questionIndex: number,
    questionId: string,
  ) => {
    const questionToRemove = questions.find((q) => q.id === questionId);
    if (!questionToRemove) return;

    const isLocalTempQuestion = questionId.startsWith('custom-');
    const isApiCustomQuestion = questionToRemove.isCustomQuestion;

    if (!isLocalTempQuestion && !isApiCustomQuestion) {
      toast.error('AI-generated questions cannot be deleted.');
      return;
    }

    if (isApiCustomQuestion && !isLocalTempQuestion && seedUuid) {
      try {
        setDeletingQuestionId(questionId);
        await deleteQuestionAsync({ seedUuid, questionUuid: questionId });
        if (currentQuestionIndex >= questionIndex && currentQuestionIndex > 0) {
          setCurrentQuestionIndex(currentQuestionIndex - 1);
        } else if (currentQuestionIndex >= questions.length - 1) {
          setCurrentQuestionIndex(Math.max(0, questions.length - 2));
        }
        return;
      } catch {
        return;
      } finally {
        setDeletingQuestionId(null);
      }
    }

    if (isLocalTempQuestion) {
      setCustomQuestions((prev) => prev.filter((q) => q.id !== questionId));
      if (currentQuestionIndex >= questionIndex && currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      } else if (currentQuestionIndex >= questions.length - 1) {
        setCurrentQuestionIndex(Math.max(0, questions.length - 2));
      }
      setSelectedInsights((prev) => {
        const n = { ...prev };
        delete n[questionId];
        return n;
      });
      setCustomQuestionInput((prev) => {
        const n = { ...prev };
        delete n[questionId];
        return n;
      });
      setCustomInsights((prev) => {
        const n = { ...prev };
        delete n[questionId];
        return n;
      });
      setUserInputValue((prev) => {
        const n = { ...prev };
        delete n[questionId];
        return n;
      });
    }
  };

  const handleCustomQuestionSubmit = async (questionId: string) => {
    const input = customQuestionInput[questionId];
    if (!input?.trim() || !seedUuid) return;

    setSubmittingQuestionId(questionId);

    try {
      const newQuestion = await addQuestionAsync({
        seedUuid,
        question: input.trim(),
      });
      setCustomQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setCustomQuestionInput((prev) => {
        const n = { ...prev };
        delete n[questionId];
        return n;
      });

      addLoadingOperation(newQuestion.uuid, 'insights');
      addLoadingOperation(newQuestion.uuid, 'possibleAnswer');
      generateInsightsMutation.mutate({
        seedUuid,
        questionUuid: newQuestion.uuid,
      });
      generatePossibleAnswerMutation.mutate({
        seedUuid,
        questionUuid: newQuestion.uuid,
      });

      telemetry.log('ideaPlayground.customQuestion.submitted', {
        seedUuid,
        questionUuid: newQuestion.uuid,
        questionText: input.trim(),
      });
      toast.success('Question added! Generating insights...');
    } catch (error) {
      telemetry.error('ideaPlayground.customQuestion.submit.failed', error);
    } finally {
      setSubmittingQuestionId(null);
    }
  };

  const handleGenerateIdeasClick = useCallback(() => {
    if (hasInputsChangedSinceGeneration && hasGeneratedConcepts) {
      const actions: IActionButton[] = [
        {
          title: 'Revert Changes',
          variant: 'light',
          onClick: () => {
            closeModal();
            revertToGenerationState();
          },
        },
        {
          title: 'Regenerate',
          variant: 'primary',
          onClick: () => {
            closeModal();
            clearSelectedConcepts();
            setInputsAtGeneration({ ...selectedInsights });
            setQuestionsSnapshotAtGeneration([...apiQuestions]);
            onGenerateIdeas?.();
          },
        },
      ];

      openModal(
        Modal.Confirmation,
        {
          title: 'Regenerate Concepts?',
          subtitle:
            "You've changed your inputs. Your previously generated concepts will be lost. You can revert your changes or regenerate with the new inputs.",
          actions,
        },
        { position: 'center', shouldCloseOnOverlayClick: true },
      );
    } else {
      setInputsAtGeneration({ ...selectedInsights });
      setQuestionsSnapshotAtGeneration([...apiQuestions]);
      onGenerateIdeas?.();
    }
  }, [
    hasInputsChangedSinceGeneration,
    hasGeneratedConcepts,
    selectedInsights,
    apiQuestions,
    onGenerateIdeas,
    openModal,
    closeModal,
    revertToGenerationState,
    clearSelectedConcepts,
  ]);

  // Compute loading state for current question
  const currentQuestionLoadingState = useMemo(() => {
    if (!currentQuestion?.id) return { isLoading: false, message: '' };

    const operations = loadingOperations[currentQuestion.id];
    if (!operations || operations.size === 0)
      return { isLoading: false, message: '' };

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

  const hasUserAnswerOnScreen = useMemo(() => {
    if (!currentQuestion?.id) return false;
    const currentApiQ = apiQuestions.find((q) => q.uuid === currentQuestion.id);
    return !!currentApiQ?.userAnswer;
  }, [currentQuestion?.id, apiQuestions]);

  // Render
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
        <div
          ref={containerRef}
          className='relative flex flex-1 items-center justify-center pb-20'
        >
          <PlaygroundLoadingIndicator
            show={isLoadingQuestions}
            message='Generating innovation questions...'
            className='pointer-events-none absolute inset-0 z-[9999] flex items-center justify-center'
            usePortal={false}
          />

          <PlaygroundLoadingIndicator
            show={currentQuestionLoadingState.isLoading}
            message={currentQuestionLoadingState.message}
            className='pointer-events-none absolute left-10 top-5 z-[9999]'
            usePortal={false}
          />

          {!isLoadingQuestions && currentQuestion && (
            <>
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
                    isSubmittingCustomQuestion={
                      submittingQuestionId === currentQuestion.id
                    }
                    userInputValue={userInputValue[currentQuestion.id]}
                    isSubmittingUserInput={isSubmittingUserInput}
                    onCustomQuestionInputChange={(value) =>
                      setCustomQuestionInput((prev) => ({
                        ...prev,
                        [currentQuestion.id]: value,
                      }))
                    }
                    onCustomQuestionSubmit={() =>
                      handleCustomQuestionSubmit(currentQuestion.id)
                    }
                    onUserInputChange={(value) =>
                      setUserInputValue((prev) => ({
                        ...prev,
                        [currentQuestion.id]: value,
                      }))
                    }
                    onUserInputSubmit={handleUserInputSubmit}
                  />
                </div>

                <div className='pointer-events-none absolute inset-0'>
                  <FloatingInsights
                    currentInsights={currentInsights}
                    currentQuestion={currentQuestion}
                    apiQuestions={apiQuestions}
                    selectedInsights={selectedInsights}
                    seedUuid={seedUuid || ''}
                    elementRects={elementRects}
                    onSelectionChange={handleSelectionChange}
                    onInsightDoubleClick={handleInsightDoubleClick}
                    onUserAnswerDelete={handleUserAnswerDelete}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {!isLoadingQuestions && currentQuestion && (
          <QuestionNavigationFooter
            questions={questions}
            currentIndex={currentQuestionIndex}
            isQuestionAnswered={isQuestionAnswered}
            onQuestionSelect={handleQuestionSelect}
            onAddQuestion={handleAddQuestion}
            onRemoveQuestion={handleRemoveQuestion}
            onGenerateIdeas={handleGenerateIdeasClick}
            onViewConcepts={onViewConcepts}
            hasGeneratedConcepts={hasGeneratedConcepts}
            hasInputsChangedSinceGeneration={hasInputsChangedSinceGeneration}
            deletingQuestionId={deletingQuestionId}
          />
        )}

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
