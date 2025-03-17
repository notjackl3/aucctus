import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'react-toastify';
import {
  useDeleteConceptSeedDraft,
  useGenerateConceptIncubationClarifyingQuestions,
  useGetConceptSeedDraftAnswers,
  useSaveConceptSeedDraftAnswer,
  useUpdateConceptSeedDraftAnswer,
  useUpdateConceptSeedDraftAnswerAndDeleteHigherOrderAnswers,
} from '@hooks/query/concepts.hook';
import { useQueryClient } from 'react-query';
import QuestionDisplay from './question/QuestionDisplay';
import { v4 as uuidv4 } from 'uuid';
import { IncubationAnswerPayload } from '@libs/api/concepts';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import LoadingMask from './util/LoadingMask';
import QuestionnaireHeader from './question/QuestionnaireHeader';
import AnswerInput from './answer/AnswerInput';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';
import { IncubationAnswer } from '@libs/api/concepts';
import { useTransition, animated } from 'react-spring';
import ConfirmAnswerUpdate from './answer/ConfirmAnswerUpdate';
import { ConceptIncubationClarifyingQuestion } from '@libs/api/types/conceptSeedQuestionnaire';
import { useDispatchIncubationAnimation } from '../hooks/incubation-animation-event.hook';

type advanceActionType = 'to-next-question' | 'to-clarifying-questions' | false;

// Types
interface UserInteractionProps {}

// Main component
const UserInteraction: React.FC<UserInteractionProps> = () => {
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

  // ===== LOCAL STATE =====
  const [answerValue, setAnswerValue] = useState<string>('');
  const advanceAction = useRef<advanceActionType>(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // ===== API MUTATIONS AND QUERIES =====
  const { mutate: deleteDraft, isLoading: isDeleteDraftLoading } =
    useDeleteConceptSeedDraft();
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

  const { dispatchAnimationEvent } = useDispatchIncubationAnimation();

  const dispatchAiSuggestionsEvent = useCallback(() => {
    if (!activeQuestion) return;

    const inputAnswer =
      answerValue.trim().length > 0 ? [answerValue.trim()] : [];

    const event = new CustomEvent('aucctus-generate-ai-suggestions', {
      detail: {
        identifier: activeQuestion.identifier,
        answer: [
          ...inputAnswer,
          ...currentTextAnswerList.map((answer) => answer.answer.trim()),
          ...currentMultiSelectAnswerList.map((answer) => answer.answer.trim()),
        ],
      },
    });
    window.dispatchEvent(event);
  }, [
    activeQuestion,
    answerValue,
    currentTextAnswerList,
    currentMultiSelectAnswerList,
  ]);

  const goToNextQuestion = useCallback(
    (answers: IncubationAnswer[], fetchClarifyingQuestions: boolean = true) => {
      const nextQuestion = getNextQuestion(answers);
      const nextOrder = nextQuestion?.order ?? Infinity;

      if (nextOrder === Infinity && fetchClarifyingQuestions) {
        generateClarifyingQuestions(draftSeedUuid || '', {
          onSuccess: (data: ConceptIncubationClarifyingQuestion[]) => {
            setClarifyingQuestions(data);
            dispatchAnimationEvent('question-transition', () => {
              setCurrentQuestionOrder(nextOrder);
              setAnswerValue('');
            });
          },
        });
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
    if (!activeAnswer) {
      setCurrentMultiSelectAnswerList([]);
      setCurrentTextAnswerList([]);
      return;
    }

    if (
      activeQuestion?.fieldType === 'multiSelect' ||
      activeQuestion?.fieldType === 'radioButton'
    ) {
      setCurrentMultiSelectAnswerList(
        activeAnswer.answer.map((answer) => ({
          answer: answer,
          uuid: uuidv4(),
        })),
      );
      if (activeAnswer.details) {
        setCurrentTextAnswerList([
          {
            answer: activeAnswer.details,
            uuid: uuidv4(),
          },
        ]);
      } else {
        setCurrentTextAnswerList([]);
      }
    } else {
      setCurrentTextAnswerList(
        activeAnswer.answer.map((answer) => ({
          answer: answer,
          uuid: uuidv4(),
        })),
      );
    }
  }, [
    activeAnswer,
    activeQuestion,
    setCurrentTextAnswerList,
    setCurrentMultiSelectAnswerList,
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

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAnswerValue(e.target.value);
    },
    [], // No dependencies needed as it only uses the setter function
  );

  const handleAddAnswer = useCallback(() => {
    if (!allowAddAnswer) return;

    setCurrentTextAnswerList([
      ...currentTextAnswerList,
      { answer: answerValue.trim(), uuid: uuidv4() },
    ]);
    setAnswerValue('');
    dispatchAiSuggestionsEvent();
  }, [
    currentTextAnswerList,
    answerValue,
    setCurrentTextAnswerList,
    allowAddAnswer,
    dispatchAiSuggestionsEvent,
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
          onSuccess: resetQuestionnaire,
          onError: () => {
            toast.error('Failed to delete draft', {
              toastId: 'delete-draft-error',
              autoClose: 2000,
              hideProgressBar: true,
              pauseOnHover: false,
            });
          },
        });
      } else {
        resetQuestionnaire();
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
  ]);

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
    } as IncubationAnswerPayload;
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
          toast.error('Failed to submit answer', {
            toastId: 'submit-answer-error',
            autoClose: 2000,
            hideProgressBar: true,
            pauseOnHover: false,
          });
        },
      },
    );
  }, [
    activeAnswer,
    formattedAnswerPayload,
    draftSeedUuid,
    queryClient,
    updateAnswerAndDeleteHigherOrder,
    advanceAction,
    activeClarifyingQuestion,
    updateAnswer,
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
      toast.error('Please provide a valid answer question', {
        toastId: 'answer-required',
        autoClose: 2000,
        hideProgressBar: true,
        pauseOnHover: false,
      });
      return;
    }

    if (draftSeedUuid.length === 0) {
      toast.error('Failed to submit answer', {
        toastId: 'submit-answer-error',
        autoClose: 2000,
        hideProgressBar: true,
        pauseOnHover: false,
      });
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
            toast.error('Failed to submit answer', {
              toastId: 'submit-answer-error',
              autoClose: 2000,
              hideProgressBar: true,
              pauseOnHover: false,
            });
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

  // Add transition for answer input
  const answerInputTransition = useTransition(
    currentQuestionOrder !== Infinity || activeClarifyingQuestion,
    {
      from: { opacity: 0, transform: 'translateY(100px)', maxHeight: '0px' },
      enter: { opacity: 1, transform: 'translateY(0px)', maxHeight: '100px' },
      leave: { opacity: 0, transform: 'translateY(100px)', maxHeight: '0px' },
      config: { tension: 200, friction: 20, mass: 0.5 },
    },
  );

  return (
    <>
      <div className='relative flex flex-1 animate-slide-in-center flex-col'>
        <QuestionnaireHeader
          questionnaire={activeQuestionnaire}
          onGoBack={handleGoBack}
          onContinue={handleSubmitAnswer}
          isQuestionAnswered={isQuestionAnswered}
          isRequired={activeQuestion?.required ?? false}
        />
        <div className='z-[10] my-4 flex flex-1 transition-all duration-300'>
          <QuestionDisplay />
        </div>
        {answerInputTransition(
          (style, item) =>
            item && (
              <animated.div style={style}>
                <AnswerInput
                  value={answerValue}
                  onChange={onInputChange}
                  onAddAnswer={handleAddAnswer}
                  allowAddAnswer={allowAddAnswer}
                  onGenerateAiSuggestions={dispatchAiSuggestionsEvent}
                />
              </animated.div>
            ),
        )}
      </div>
      <LoadingMask isLoading={isLoading} />
      <ConfirmAnswerUpdate
        show={showConfirmation}
        onCancel={() => setShowConfirmation(false)}
        onConfirm={() => {
          doUpdateAnswer();
          setShowConfirmation(false);
        }}
      />
    </>
  );
};

export default UserInteraction;
