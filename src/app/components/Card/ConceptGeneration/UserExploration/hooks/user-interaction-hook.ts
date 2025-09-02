import {
  useGenerateConceptIncubationClarifyingQuestions,
  useGetConceptSeedDraftAnswers,
  useSaveConceptSeedDraftAnswer,
  useUpdateConceptSeedDraftAnswer,
  useUpdateConceptSeedDraftAnswerAndDeleteHigherOrderAnswers,
  useSeed,
} from '@hooks/query/concepts.hook';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import { IncubationAnswer, IncubationAnswerRequest } from '@libs/api/concepts';
import { AppPath } from '@routes/routes';
import { AnswerItem } from '@stores/concept-incubation/actions';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '@components';
import { v4 as uuidv4 } from 'uuid';
import { useDispatchIncubationAnimation } from './incubation-animation-event.hook';
import { IClarifyingQuestion } from '@libs/api/types';

type AdvanceActionType = 'to-next-question' | 'to-clarifying-questions' | false;

export const useUserInteraction = () => {
  // ===== CONTEXT AND GLOBAL STATE =====
  const {
    activeQuestionnaire,
    activeQuestion,
    currentQuestionOrder,
    draftSeedUuid,
    currentTextAnswerList,
    currentMultiSelectAnswerList,
    submittedAnswers,
    isNewSeed,
    activeClarifyingQuestion,
    setCurrentQuestionOrder,
    getNextQuestion,
    getPreviousQuestion,
    setCurrentTextAnswerList,
    setCurrentMultiSelectAnswerList,
    resetQuestionnaire,
    setSubmittedAnswers,

    setClarifyingQuestions,
    setActiveClarifyingQuestion,
  } = useConceptIncubationStore();

  // ===== ROUTE PARAMS =====
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get seed data to check for cached concepts
  const [searchParams] = useSearchParams();
  const seedUuid = searchParams.get('seed') || undefined;
  const { data: seedDraftData } = useSeed(seedUuid, { status: 'draft' });

  // Check if we have cached concepts
  const hasCachedConcepts = useMemo(() => {
    return (
      seedDraftData?.cachedConcepts &&
      Array.isArray(seedDraftData.cachedConcepts) &&
      seedDraftData.cachedConcepts.length > 0
    );
  }, [seedDraftData]);

  // Check if this is the final question
  const isFinalQuestion = useMemo(() => {
    if (!activeQuestion) return false;

    const nextQuestion = getNextQuestion(submittedAnswers);
    return !nextQuestion; // If no next question, this is the final one
  }, [activeQuestion, getNextQuestion, submittedAnswers]);

  // Check if there are existing clarifying questions
  const hasExistingClarifyingQuestions = useMemo(() => {
    return (
      seedDraftData?.clarifyingQuestions &&
      seedDraftData.clarifyingQuestions.length > 0
    );
  }, [seedDraftData]);

  // ===== LOCAL STATE =====
  const [answerValue, setAnswerValue] = useState<string>('');
  const advanceAction = useRef<AdvanceActionType>(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // ===== API MUTATIONS AND QUERIES =====
  const { mutate: saveAnswer, isLoading: isSaveAnswerLoading } =
    useSaveConceptSeedDraftAnswer();
  const { mutateAsync: updateAnswer, isLoading: isUpdateAnswerLoading } =
    useUpdateConceptSeedDraftAnswer();
  const {
    mutateAsync: updateAnswerAndDeleteHigherOrder,
    isLoading: isUpdateAnswerAndDeleteHigherOrderLoading,
  } = useUpdateConceptSeedDraftAnswerAndDeleteHigherOrderAnswers();
  const { data: seedDraftAnswers, isLoading: isSeedDraftAnswersLoading } =
    useGetConceptSeedDraftAnswers(draftSeedUuid || '');
  const {
    mutate: generateClarifyingQuestions,
    isLoading: isGenerateClarifyingQuestionsLoading,
  } = useGenerateConceptIncubationClarifyingQuestions();

  const { dispatchAnimationEvent } = useDispatchIncubationAnimation();

  const isLoading = useMemo(
    () =>
      isSeedDraftAnswersLoading ||
      isSaveAnswerLoading ||
      isUpdateAnswerLoading ||
      isUpdateAnswerAndDeleteHigherOrderLoading ||
      isGenerateClarifyingQuestionsLoading,
    [
      isSeedDraftAnswersLoading,
      isSaveAnswerLoading,
      isUpdateAnswerLoading,
      isUpdateAnswerAndDeleteHigherOrderLoading,
      isGenerateClarifyingQuestionsLoading,
    ],
  );

  const answersHaveChanged = useRef(false);

  const activeAnswer = useMemo(() => {
    return seedDraftAnswers?.find(
      (answer) =>
        answer.question.id === activeQuestion?.id ||
        answer.question.id === activeClarifyingQuestion?.question.id,
    );
  }, [seedDraftAnswers, activeQuestion, activeClarifyingQuestion]);

  const goToNextQuestion = useCallback(
    (answers: IncubationAnswer[], fetchClarifyingQuestions: boolean = true) => {
      const nextQuestion = getNextQuestion(answers);
      const nextOrder = nextQuestion?.order ?? Infinity;

      if (nextOrder === Infinity && fetchClarifyingQuestions) {
        generateClarifyingQuestions(
          {
            seedUuid: draftSeedUuid || '',
          },
          {
            onSuccess: (data: IClarifyingQuestion[]) => {
              answersHaveChanged.current = false;
              setClarifyingQuestions(data);
              dispatchAnimationEvent('question-transition', () => {
                setCurrentQuestionOrder(nextOrder);
                setAnswerValue('');
              });
            },
          },
        );
      } else {
        dispatchAnimationEvent('question-transition', () => {
          setSubmittedAnswers(answers);
          setCurrentQuestionOrder(nextOrder);
          setAnswerValue('');
        });
      }
    },
    [
      dispatchAnimationEvent,
      getNextQuestion,
      setSubmittedAnswers,
      setCurrentQuestionOrder,
      setClarifyingQuestions,
      draftSeedUuid,
      generateClarifyingQuestions,
    ],
  );

  useEffect(() => {
    const answers = [...(seedDraftAnswers ?? [])].sort(
      (a, b) => a.question.order - b.question.order,
    );

    // Populate store with submitted answers if not already set
    if (
      !isNewSeed &&
      seedDraftAnswers &&
      seedDraftAnswers.length > 0 &&
      submittedAnswers.length === 0
    ) {
      setSubmittedAnswers(answers);
      const highestOrderAnswer = Math.max(
        ...answers.map((a) => a.question.order),
      );
      const highestOrderQuestion = Math.max(
        ...Object.values(activeQuestionnaire?.questions ?? {}).map(
          (q) => q.order,
        ),
      );
      if (highestOrderAnswer >= highestOrderQuestion) {
        setCurrentQuestionOrder(Infinity);
      } else {
        setCurrentQuestionOrder(highestOrderAnswer);
      }
    }

    if (advanceAction.current === 'to-next-question') {
      goToNextQuestion(answers);
      advanceAction.current = false;
    } else if (advanceAction.current === 'to-clarifying-questions') {
      dispatchAnimationEvent('fade', () => {
        setSubmittedAnswers(answers);
        setActiveClarifyingQuestion(undefined);
        setAnswerValue('');
      });
      advanceAction.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    seedDraftAnswers,
    submittedAnswers,
    setSubmittedAnswers,
    hasExistingClarifyingQuestions,
    activeQuestionnaire,
  ]);

  useEffect(() => {
    const handleAnswerUpdate = (event: CustomEvent) =>
      setAnswerValue(event.detail.answer);

    window.addEventListener(
      'aucctus-incubation-answer-update',
      handleAnswerUpdate as EventListener,
    );

    return () =>
      window.removeEventListener(
        'aucctus-incubation-answer-update',
        handleAnswerUpdate as EventListener,
      );
  }, []);

  const updateCurrentAnswerLists = useCallback(
    (answer: IncubationAnswer | undefined) => {
      if (!answer) {
        setCurrentMultiSelectAnswerList([]);
        setCurrentTextAnswerList([]);
        return;
      }

      if (
        activeQuestion?.fieldType === 'multiSelect' ||
        activeQuestion?.fieldType === 'radioButton'
      ) {
        setCurrentMultiSelectAnswerList(
          answer.answer.map((answer) => ({
            answer: answer,
            uuid: uuidv4(),
          })),
        );
        if (answer.details) {
          setCurrentTextAnswerList([
            {
              answer: answer.details,
              uuid: uuidv4(),
            },
          ]);
        } else {
          setCurrentTextAnswerList([]);
        }
      } else {
        setCurrentTextAnswerList(
          answer.answer.map((answer) => ({
            answer: answer,
            uuid: uuidv4(),
          })),
        );
      }
    },
    [activeQuestion, setCurrentMultiSelectAnswerList, setCurrentTextAnswerList],
  );

  useEffect(() => {
    updateCurrentAnswerLists(activeAnswer);
  }, [
    activeAnswer,
    activeQuestion,
    setCurrentTextAnswerList,
    setCurrentMultiSelectAnswerList,
    updateCurrentAnswerLists,
  ]);

  const dispatchAiSuggestionsEvent = useCallback(() => {
    const question = activeClarifyingQuestion
      ? activeClarifyingQuestion.question
      : activeQuestion;

    if (!question) return;

    const inputAnswer =
      answerValue.trim().length > 0 ? [answerValue.trim()] : [];

    const event = new CustomEvent('aucctus-generate-ai-suggestions', {
      detail: {
        questionId: question.id,
        answer: [
          ...inputAnswer,
          ...currentTextAnswerList.map((answer: AnswerItem) =>
            answer.answer.trim(),
          ),
          ...currentMultiSelectAnswerList.map((answer: AnswerItem) =>
            answer.answer.trim(),
          ),
        ],
      },
    });
    window.dispatchEvent(event);
  }, [
    activeQuestion,
    answerValue,
    currentTextAnswerList,
    currentMultiSelectAnswerList,
    activeClarifyingQuestion,
  ]);

  const isQuestionAnswered = useMemo(() => {
    if (
      activeQuestion?.fieldType === 'multiSelect' ||
      activeQuestion?.fieldType === 'radioButton'
    ) {
      return currentMultiSelectAnswerList.length > 0;
    } else {
      return currentTextAnswerList.length > 0;
    }
  }, [activeQuestion, currentTextAnswerList, currentMultiSelectAnswerList]);

  const allowAddAnswer = useMemo(() => {
    const hasAnswer = currentTextAnswerList.some(
      (answer) => answer.answer.trim() === answerValue.trim(),
    );

    return !hasAnswer;
  }, [currentTextAnswerList, answerValue]);

  const formattedAnswerPayload = useMemo(() => {
    const isMultiSelectType =
      activeQuestion?.fieldType === 'multiSelect' ||
      activeQuestion?.fieldType === 'radioButton';

    const question = activeClarifyingQuestion?.question ?? activeQuestion;

    return {
      questionId: question?.id,
      fieldType: question?.fieldType,
      answer: isMultiSelectType
        ? currentMultiSelectAnswerList.map((answer) => answer.answer)
        : currentTextAnswerList.map((answer) => answer.answer),
      details: isMultiSelectType
        ? currentTextAnswerList.map((answer) => answer.answer).join('\n')
        : '',
    } as IncubationAnswerRequest;
  }, [
    activeQuestion,
    currentMultiSelectAnswerList,
    currentTextAnswerList,
    activeClarifyingQuestion,
  ]);

  const isDuplicateAnswer = useCallback(() => {
    const answeredQuestion = submittedAnswers.find(
      (answer) =>
        answer.question.id === activeQuestion?.id ||
        answer.question.id === activeClarifyingQuestion?.question.id,
    );

    if (!answeredQuestion) return false;

    // Check if answers are the same
    const isAnswerSame =
      formattedAnswerPayload.answer.length === answeredQuestion.answer.length &&
      formattedAnswerPayload.answer.every((answer) =>
        answeredQuestion.answer.includes(answer),
      );

    // Check if details are the same
    const isDetailsSame =
      (formattedAnswerPayload.details ?? '') ===
      (answeredQuestion.details ?? '');

    return isAnswerSame && isDetailsSame;
  }, [
    submittedAnswers,
    activeQuestion,
    activeClarifyingQuestion,
    formattedAnswerPayload,
  ]);

  const doRevertAnswer = useCallback(() => {
    updateCurrentAnswerLists(activeAnswer);
  }, [activeAnswer, updateCurrentAnswerLists]);

  const doUpdateAnswer = useCallback(
    (forceDelete: boolean = false) => {
      if (!activeAnswer) return;

      if (activeClarifyingQuestion) {
        // For clarifying questions, use the regular update method
        updateAnswer(
          {
            answerId: activeAnswer.id,
            body: {
              ...formattedAnswerPayload,
              answerId: activeAnswer.id,
            },
          },
          {
            onSuccess: async () => {
              advanceAction.current = 'to-clarifying-questions';
              answersHaveChanged.current = true;
              await queryClient.refetchQueries([
                AucctusQueryKeys.conceptSeedDraftAnswers,
                draftSeedUuid,
              ]);
            },
            onError: () => {
              toast.error('Failed to submit answer');
            },
          },
        );
      } else {
        // For regular questions, use the delete higher order method
        updateAnswerAndDeleteHigherOrder(
          {
            answerId: activeAnswer.id,
            body: {
              ...formattedAnswerPayload,
              answerId: activeAnswer.id,
            },
            forceDelete,
          },
          {
            onSuccess: async () => {
              advanceAction.current = 'to-next-question';
              answersHaveChanged.current = true;
              await queryClient.refetchQueries([
                AucctusQueryKeys.conceptSeedDraftAnswers,
                draftSeedUuid,
              ]);
            },
            onError: () => {
              toast.error('Failed to submit answer');
            },
          },
        );
      }
    },
    [
      activeAnswer,
      formattedAnswerPayload,
      draftSeedUuid,
      queryClient,
      updateAnswerAndDeleteHigherOrder,
      activeClarifyingQuestion,
      updateAnswer,
    ],
  );

  const doConfirmAnswer = useCallback(() => {
    if (activeAnswer) {
      // Update existing answer
      doUpdateAnswer();
    } else {
      // Create new answer (for clarifying questions without existing answers)
      saveAnswer(
        {
          uuid: draftSeedUuid,
          body: formattedAnswerPayload,
        },
        {
          onSuccess: async () => {
            advanceAction.current = activeClarifyingQuestion
              ? 'to-clarifying-questions'
              : 'to-next-question';
            await queryClient.refetchQueries([
              AucctusQueryKeys.conceptSeedDraftAnswers,
              draftSeedUuid,
            ]);
          },
          onError: () => {
            toast.error('Failed to submit answer');
          },
        },
      );
    }
  }, [
    activeAnswer,
    doUpdateAnswer,
    saveAnswer,
    draftSeedUuid,
    formattedAnswerPayload,
    activeClarifyingQuestion,
    queryClient,
  ]);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setAnswerValue(e.target.value);
    },
    [],
  );

  const handleAddAnswer = useCallback(() => {
    if (!allowAddAnswer) return;

    setCurrentTextAnswerList([
      ...currentTextAnswerList,
      { answer: answerValue.trim(), uuid: uuidv4() },
    ]);
    setAnswerValue('');
  }, [
    currentTextAnswerList,
    answerValue,
    setCurrentTextAnswerList,
    allowAddAnswer,
  ]);

  const handleGoBack = useCallback(() => {
    if (currentQuestionOrder === undefined) return;

    if (activeClarifyingQuestion) {
      dispatchAnimationEvent('fade', () => {
        setActiveClarifyingQuestion(undefined);
        setCurrentMultiSelectAnswerList([]);
        setCurrentTextAnswerList([]);
        setAnswerValue('');
      });
      return;
    }

    const previousQuestion = getPreviousQuestion(submittedAnswers);

    if (!previousQuestion) {
      resetQuestionnaire();
      navigate(AppPath.IncubateConcept, { replace: true });
    } else {
      dispatchAnimationEvent('fade', () => {
        setCurrentQuestionOrder(previousQuestion.order);
        setAnswerValue('');
      });
    }
  }, [
    currentQuestionOrder,
    setCurrentQuestionOrder,
    resetQuestionnaire,
    dispatchAnimationEvent,
    activeClarifyingQuestion,
    submittedAnswers,
    getPreviousQuestion,
    setActiveClarifyingQuestion,
    setCurrentMultiSelectAnswerList,
    setCurrentTextAnswerList,
    navigate,
  ]);

  const handleSubmitAnswer = useCallback(() => {
    if (currentQuestionOrder === undefined) return;

    if (isDuplicateAnswer()) {
      if (activeClarifyingQuestion) {
        dispatchAnimationEvent('fade', () => {
          setAnswerValue('');
          setActiveClarifyingQuestion(undefined);
        });
      } else {
        goToNextQuestion(submittedAnswers, answersHaveChanged.current);
      }
      return;
    }

    if (!isQuestionAnswered && activeQuestion?.required) {
      toast.error('Please provide a valid answer question');
      return;
    }

    if (draftSeedUuid.length === 0) {
      toast.error('Failed to submit answer');
      return;
    }

    // Show confirmation for clarifying questions (whether new or updating)
    if (activeClarifyingQuestion && hasCachedConcepts) {
      setShowConfirmation(true);
      return;
    }

    if (activeAnswer) {
      // For final question, show confirmation if we have cached concepts OR existing clarifying questions
      // Both scenarios require user awareness as changing final answer invalidates existing data
      if (isFinalQuestion) {
        if (hasCachedConcepts || hasExistingClarifyingQuestions) {
          setShowConfirmation(true);
        } else {
          // No cached concepts or clarifying questions, proceed without confirmation
          doUpdateAnswer();
        }
        return;
      }

      // Show confirmation for main questions that might affect subsequent questions or generated concepts
      if (!!activeAnswer.question.identifier) {
        setShowConfirmation(true);
      } else {
        doUpdateAnswer();
      }
    } else {
      saveAnswer(
        {
          uuid: draftSeedUuid,
          body: formattedAnswerPayload,
        },
        {
          onSuccess: async () => {
            advanceAction.current = activeClarifyingQuestion
              ? 'to-clarifying-questions'
              : 'to-next-question';
            if (advanceAction.current === 'to-next-question') {
              answersHaveChanged.current = true;
            }
            await queryClient.refetchQueries([
              AucctusQueryKeys.conceptSeedDraftAnswers,
              draftSeedUuid,
            ]);
          },
          onError: () => {
            toast.error('Failed to submit answer');
          },
        },
      );
    }
  }, [
    activeAnswer,
    activeClarifyingQuestion,
    activeQuestion,
    currentQuestionOrder,
    dispatchAnimationEvent,
    doUpdateAnswer,
    draftSeedUuid,
    formattedAnswerPayload,
    goToNextQuestion,
    isDuplicateAnswer,
    isQuestionAnswered,
    queryClient,
    saveAnswer,
    setActiveClarifyingQuestion,
    submittedAnswers,
    isFinalQuestion,
    hasCachedConcepts,
    hasExistingClarifyingQuestions,
    setShowConfirmation,
  ]);

  const loadingMessage = useMemo(
    () =>
      isGenerateClarifyingQuestionsLoading
        ? 'Generating clarifying questions...'
        : undefined,
    [isGenerateClarifyingQuestionsLoading],
  );

  return {
    // State
    answerValue,
    showConfirmation,
    isLoading,
    loadingMessage,
    activeQuestionnaire,
    activeQuestion,
    currentQuestionOrder,
    isQuestionAnswered,
    allowAddAnswer,
    activeAnswer,
    seedDraftData,

    // Actions
    setAnswerValue,
    setShowConfirmation,
    onInputChange,
    handleAddAnswer,
    handleGoBack,
    handleSubmitAnswer,
    doUpdateAnswer,
    doConfirmAnswer,
    doRevertAnswer,
    dispatchAiSuggestionsEvent,
  };
};
