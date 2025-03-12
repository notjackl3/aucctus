/* eslint-disable react-hooks/exhaustive-deps */
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
  useGetConceptSeedDraftAnswers,
  useSaveConceptSeedDraftAnswer,
  useUpdateConceptSeedDraftAnswer,
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
    setCurrentQuestionOrder,
    getNextQuestion,
    getPreviousQuestion,
    setCurrentTextAnswerList,
    setCurrentMultiSelectAnswerList,
    resetQuestionnaire,
    setSubmittedAnswers,
  } = useConceptIncubationStore();
  const queryClient = useQueryClient();

  // ===== LOCAL STATE =====
  const [answerValue, setAnswerValue] = useState<string>('');
  const shouldAdvance = useRef(false);

  // ===== API MUTATIONS AND QUERIES =====
  const { mutate: deleteDraft, isLoading: isDeleteDraftLoading } =
    useDeleteConceptSeedDraft();
  const { mutate: saveAnswer, isLoading: isSaveAnswerLoading } =
    useSaveConceptSeedDraftAnswer();
  const { mutateAsync: updateAnswer, isLoading: isUpdateAnswerLoading } =
    useUpdateConceptSeedDraftAnswer();
  const { data: seedDraftAnswers, isLoading: isSeedDraftAnswersLoading } =
    useGetConceptSeedDraftAnswers(draftSeedUuid || '');

  useEffect(() => {
    const answers = (seedDraftAnswers ?? []).sort(
      (a, b) => a.question.order - b.question.order,
    );

    setSubmittedAnswers(answers);

    if (shouldAdvance.current) {
      goToNextQuestion(answers);
      shouldAdvance.current = false;
    }
  }, [seedDraftAnswers]);

  const isLoading = useMemo(
    () =>
      isSeedDraftAnswersLoading ||
      isDeleteDraftLoading ||
      isSaveAnswerLoading ||
      isUpdateAnswerLoading,
    [
      isSeedDraftAnswersLoading,
      isDeleteDraftLoading,
      isSaveAnswerLoading,
      isUpdateAnswerLoading,
    ],
  );

  const activeAnswer = useMemo(() => {
    return seedDraftAnswers?.find(
      (answer) => answer.question.id === activeQuestion?.id,
    );
  }, [seedDraftAnswers, activeQuestion]);

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

  const dispatchAnimationEvent = useCallback(
    (type: 'forward' | 'backward', callback: () => void) => {
      const event = new CustomEvent('aucctus-question-transition', {
        detail: {
          type,
          callback,
        },
      });
      window.dispatchEvent(event);
    },
    [],
  );

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
    (answers: IncubationAnswer[]) => {
      const nextQuestion = getNextQuestion(answers);
      if (nextQuestion) {
        dispatchAnimationEvent('forward', () => {
          setCurrentQuestionOrder(nextQuestion.order);
          setAnswerValue('');
        });
      }
    },
    [dispatchAnimationEvent, getNextQuestion, setCurrentQuestionOrder],
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
  }, [activeAnswer, activeQuestion]);

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
  }, [activeQuestion, currentTextAnswerList, answerValue]);

  // ===== EVENT HANDLERS =====
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

    const previousQuestion = getPreviousQuestion();

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
      dispatchAnimationEvent('backward', () => {
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
  ]);

  const formattedAnswerPayload = useMemo(() => {
    const isMultiSelectType =
      activeQuestion?.fieldType === 'multiSelect' ||
      activeQuestion?.fieldType === 'radioButton';

    return {
      questionId: activeQuestion?.id,
      fieldType: activeQuestion?.fieldType,
      answer: isMultiSelectType
        ? currentMultiSelectAnswerList.map((answer) => answer.answer)
        : currentTextAnswerList.map((answer) => answer.answer),
      details: isMultiSelectType
        ? currentTextAnswerList.map((answer) => answer.answer).join('\n')
        : '',
    } as IncubationAnswerPayload;
  }, [activeQuestion, currentMultiSelectAnswerList, currentTextAnswerList]);

  const isDuplicateAnswer = useCallback(() => {
    const answeredQuestion = submittedAnswers.find(
      (answer) => answer.question.id === activeQuestion?.id,
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
  }, [submittedAnswers, activeQuestion, formattedAnswerPayload]);

  const handleSubmitAnswer = useCallback(() => {
    if (currentQuestionOrder === undefined) return;

    if (isDuplicateAnswer()) {
      goToNextQuestion(submittedAnswers);
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
            shouldAdvance.current = true;
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
    } else {
      saveAnswer(
        {
          uuid: draftSeedUuid,
          body: formattedAnswerPayload,
        },
        {
          onSuccess: async () => {
            shouldAdvance.current = true;
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
    currentQuestionOrder,
    setCurrentQuestionOrder,
    isQuestionAnswered,
    activeQuestion,
    draftSeedUuid,
    formattedAnswerPayload,
    saveAnswer,
    updateAnswer,
    queryClient,
    activeAnswer,
  ]);

  // ===== MAIN RENDER =====
  return (
    <>
      <div className='relative flex flex-1 animate-slide-in-center flex-col gap-4'>
        <QuestionnaireHeader
          questionnaire={activeQuestionnaire}
          onGoBack={handleGoBack}
          onContinue={handleSubmitAnswer}
          isQuestionAnswered={isQuestionAnswered}
          isRequired={activeQuestion?.required ?? false}
        />
        <div className='z-[10] flex flex-1'>
          <QuestionDisplay />
        </div>
        <AnswerInput
          value={answerValue}
          onChange={onInputChange}
          onAddAnswer={handleAddAnswer}
          allowAddAnswer={allowAddAnswer}
          onGenerateAiSuggestions={dispatchAiSuggestionsEvent}
        />
      </div>
      <LoadingMask isLoading={isLoading} />
    </>
  );
};

export default UserInteraction;
