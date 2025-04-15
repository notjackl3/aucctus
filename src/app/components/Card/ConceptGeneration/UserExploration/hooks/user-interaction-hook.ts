import {
  useDeleteSeed,
  useGenerateConceptIncubationClarifyingQuestions,
  useGetConceptSeedDraftAnswers,
  useSaveConceptSeedDraftAnswer,
  useUpdateConceptSeedDraftAnswer,
  useUpdateConceptSeedDraftAnswerAndDeleteHigherOrderAnswers,
} from '@hooks/query/concepts.hook';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import { IncubationAnswer, IncubationAnswerRequest } from '@libs/api/concepts';
import { AppPath } from '@routes/routes';
import { AnswerItem } from '@stores/concept-incubation/actions';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from '@components';
import { v4 as uuidv4 } from 'uuid';
import { useDispatchIncubationAnimation } from './incubation-animation-event.hook';
import telemetry from '@libs/telemetry';
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

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ===== LOCAL STATE =====
  const [answerValue, setAnswerValue] = useState<string>('');
  const advanceAction = useRef<AdvanceActionType>(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // ===== API MUTATIONS AND QUERIES =====
  const { mutate: deleteDraft, isLoading: isDeleteDraftLoading } =
    useDeleteSeed({ status: 'draft' });
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
      isDeleteDraftLoading ||
      isSaveAnswerLoading ||
      isUpdateAnswerLoading ||
      isUpdateAnswerAndDeleteHigherOrderLoading ||
      isGenerateClarifyingQuestionsLoading,
    [
      isSeedDraftAnswersLoading,
      isDeleteDraftLoading,
      isSaveAnswerLoading,
      isUpdateAnswerLoading,
      isUpdateAnswerAndDeleteHigherOrderLoading,
      isGenerateClarifyingQuestionsLoading,
    ],
  );

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
          setCurrentQuestionOrder(nextOrder);
          setAnswerValue('');
        });
      }
    },
    [
      dispatchAnimationEvent,
      getNextQuestion,
      setCurrentQuestionOrder,
      setClarifyingQuestions,
      draftSeedUuid,
      generateClarifyingQuestions,
    ],
  );

  useEffect(() => {
    const answers = (seedDraftAnswers ?? []).sort(
      (a, b) => a.question.order - b.question.order,
    );

    setSubmittedAnswers(answers);

    if (advanceAction.current === 'to-next-question') {
      goToNextQuestion(answers);
      advanceAction.current = false;
    } else if (advanceAction.current === 'to-clarifying-questions') {
      dispatchAnimationEvent('fade', () => {
        setActiveClarifyingQuestion(undefined);
        setAnswerValue('');
      });
      advanceAction.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedDraftAnswers]);

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

  const doUpdateAnswer = useCallback(() => {
    if (!activeAnswer) return;

    const updateMethod = activeClarifyingQuestion
      ? updateAnswer
      : updateAnswerAndDeleteHigherOrder;

    updateMethod(
      {
        answerId: activeAnswer.id,
        body: {
          ...formattedAnswerPayload,
          answerId: activeAnswer.id,
        },
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
  }, [
    activeAnswer,
    formattedAnswerPayload,
    draftSeedUuid,
    queryClient,
    updateAnswerAndDeleteHigherOrder,
    activeClarifyingQuestion,
    updateAnswer,
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
      if ((seedDraftAnswers ?? []).length === 0) {
        deleteDraft(draftSeedUuid || '', {
          onSuccess: () => {
            resetQuestionnaire();
            navigate(AppPath.IncubateConcept, { replace: true });
          },
          onError: (error: unknown) => {
            telemetry.error('Failed to delete unused draft', {
              seedUuid: draftSeedUuid,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
            resetQuestionnaire();
            navigate(AppPath.IncubateConcept, { replace: true });
          },
        });
      } else {
        resetQuestionnaire();
        navigate(AppPath.IncubateConcept, { replace: true });
      }
    } else {
      dispatchAnimationEvent('fade', () => {
        setCurrentQuestionOrder(previousQuestion.order);
        setAnswerValue('');
      });
    }
  }, [
    currentQuestionOrder,
    setCurrentQuestionOrder,
    draftSeedUuid,
    deleteDraft,
    resetQuestionnaire,
    seedDraftAnswers,
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
        goToNextQuestion(submittedAnswers, false);
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

    if (activeAnswer) {
      if (
        !!activeAnswer.question.identifier &&
        activeAnswer.question.order <
          submittedAnswers[submittedAnswers.length - 1].question.order
      ) {
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

    // Actions
    setAnswerValue,
    setShowConfirmation,
    onInputChange,
    handleAddAnswer,
    handleGoBack,
    handleSubmitAnswer,
    doUpdateAnswer,
    doRevertAnswer,
    dispatchAiSuggestionsEvent,
  };
};
