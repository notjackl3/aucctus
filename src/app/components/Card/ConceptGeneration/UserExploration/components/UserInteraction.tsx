/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

// Types
interface UserInteractionProps {}

// Main component
const UserInteraction: React.FC<UserInteractionProps> = () => {
  // ===== CONTEXT AND GLOBAL STATE =====
  const {
    activeQuestionnaire,
    currentQuestionIndex,
    draftSeedUuid,
    currentTextAnswerList,
    currentMultiSelectAnswerList,
    setCurrentQuestionIndex,
    setCurrentTextAnswerList,
    setCurrentMultiSelectAnswerList,
    resetQuestionnaire,
  } = useConceptIncubationStore();
  const queryClient = useQueryClient();

  // ===== LOCAL STATE =====
  const [answerValue, setAnswerValue] = useState<string>('');

  // ===== API MUTATIONS AND QUERIES =====
  const { mutate: deleteDraft, isLoading: isDeleteDraftLoading } =
    useDeleteConceptSeedDraft();
  const { mutate: saveAnswer, isLoading: isSaveAnswerLoading } =
    useSaveConceptSeedDraftAnswer();
  const { mutate: updateAnswer, isLoading: isUpdateAnswerLoading } =
    useUpdateConceptSeedDraftAnswer();
  const { data: seedDraftAnswers, isLoading: isSeedDraftAnswersLoading } =
    useGetConceptSeedDraftAnswers(draftSeedUuid || '');

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

  // ===== DERIVED STATE (MEMOIZED VALUES) =====
  const questionEntries = useMemo(
    () => Object.entries(activeQuestionnaire?.questions || {}),
    [activeQuestionnaire],
  );

  const activeQuestionEntry = useMemo(() => {
    return Object.entries(activeQuestionnaire?.questions || {})[
      currentQuestionIndex ?? 0
    ];
  }, [activeQuestionnaire, currentQuestionIndex]);

  const activeQuestion = useMemo(
    () => activeQuestionEntry[1],
    [activeQuestionEntry],
  );

  const activeAnswer = useMemo(() => {
    return seedDraftAnswers?.find(
      (answer) => answer.question.id === activeQuestion.id,
    );
  }, [seedDraftAnswers, activeQuestion]);

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

  useEffect(() => {
    if (!activeAnswer) {
      setCurrentMultiSelectAnswerList([]);
      setCurrentTextAnswerList([]);
      return;
    }

    if (
      activeQuestion.fieldType === 'multiSelect' ||
      activeQuestion.fieldType === 'radioButton'
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
      activeQuestion.fieldType === 'multiSelect' ||
      activeQuestion.fieldType === 'radioButton'
    ) {
      return currentMultiSelectAnswerList.length > 0;
    } else {
      return currentTextAnswerList.length > 0;
    }
  }, [activeQuestion, currentTextAnswerList, currentMultiSelectAnswerList]);

  const allowAddAnswer = useMemo(() => {
    if (
      activeQuestion.fieldType === 'multiSelect' ||
      activeQuestion.fieldType === 'radioButton'
    ) {
      return currentTextAnswerList.length < 1;
    }
    return true;
  }, [activeQuestion, currentTextAnswerList]);

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
      { answer: answerValue, uuid: uuidv4() },
    ]);
    setAnswerValue('');
  }, [
    currentTextAnswerList,
    answerValue,
    setCurrentTextAnswerList,
    allowAddAnswer,
  ]);

  const handleGoBack = useCallback(() => {
    if (currentQuestionIndex === undefined) return;

    if (currentQuestionIndex - 1 < 0) {
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
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setAnswerValue('');
      });
    }
  }, [
    currentQuestionIndex,
    setCurrentQuestionIndex,
    draftSeedUuid,
    deleteDraft,
    resetQuestionnaire,
    seedDraftAnswers,
    dispatchAnimationEvent,
  ]);

  const formattedAnswerPayload = useMemo(() => {
    const isMultiSelectType =
      activeQuestion.fieldType === 'multiSelect' ||
      activeQuestion.fieldType === 'radioButton';

    return {
      questionId: activeQuestion.id,
      fieldType: activeQuestion.fieldType,
      answer: isMultiSelectType
        ? currentMultiSelectAnswerList.map((answer) => answer.answer)
        : currentTextAnswerList.map((answer) => answer.answer),
      details: isMultiSelectType
        ? currentTextAnswerList.map((answer) => answer.answer).join('\n')
        : '',
    } as IncubationAnswerPayload;
  }, [activeQuestion, currentMultiSelectAnswerList, currentTextAnswerList]);

  const handleSubmitAnswer = useCallback(() => {
    if (currentQuestionIndex === undefined) return;

    if (!isQuestionAnswered && activeQuestion.required) {
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
            await queryClient.refetchQueries([
              AucctusQueryKeys.conceptSeedDraftAnswers,
              draftSeedUuid,
            ]);
            dispatchAnimationEvent('forward', () => {
              setCurrentQuestionIndex(currentQuestionIndex + 1);
              setAnswerValue('');
            });
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
            await queryClient.refetchQueries([
              AucctusQueryKeys.conceptSeedDraftAnswers,
              draftSeedUuid,
            ]);
            dispatchAnimationEvent('forward', () => {
              setCurrentQuestionIndex(currentQuestionIndex + 1);
              setAnswerValue('');
            });
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
    currentQuestionIndex,
    setCurrentQuestionIndex,
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
          currentStep={(currentQuestionIndex ?? 0) + 1}
          totalSteps={questionEntries.length}
          onGoBack={handleGoBack}
          onContinue={handleSubmitAnswer}
          isQuestionAnswered={isQuestionAnswered}
          isRequired={activeQuestion.required}
        />
        <div className='z-[10] flex flex-1'>
          <QuestionDisplay />
        </div>
        <AnswerInput
          value={answerValue}
          onChange={onInputChange}
          onAddAnswer={handleAddAnswer}
          allowAddAnswer={allowAddAnswer}
        />
      </div>
      <LoadingMask isLoading={isLoading} />
    </>
  );
};

export default UserInteraction;
