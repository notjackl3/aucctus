import React, { useMemo, useRef, Dispatch, SetStateAction } from 'react';
import {
  useConceptIncubation,
  AnswerItem,
} from '@stores/concept-incubation.store';
import { CompletionIcon } from './QuestionIcons';
import { useQuestionTransition } from '../../hooks/question-transition.hook';
import { useAnswerList } from '../../hooks/answer-list.hook';
import { PointerEventMask } from '../util/PointerEventMask';
import { useQuestionIconLine } from '../../hooks/question-icon-line.hook';
import { QuestionEntry } from '../../types/question';
import CompletedQuestions from './CompletedQuestions';
import MultiSelectAnswers from '../answer/MultiSelectAnswers';
import TextAnswers from '../answer/TextAnswers';
import CurrentQuestion from './CurrentQuestion';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';
interface QuestionDisplayProps {}

/**
 * Main QuestionDisplay component
 * Orchestrates the display of questions and answers in the concept generation flow
 */
const QuestionDisplay: React.FC<QuestionDisplayProps> = () => {
  const { currentQuestionIndex, activeQuestionnaire } =
    useConceptIncubationStore();

  const {
    showMask,
    questionIconRef,
    questionLabelRef,
    nextCompletionIconRef,
    componentRef,
    answerRowRef,
    multiSelectAnswersRef,
  } = useQuestionTransition();

  const questionIconLineRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  // Get current question data
  const activeQuestionEntry = useMemo<QuestionEntry | undefined>(() => {
    return Object.entries(activeQuestionnaire?.questions ?? {})[
      currentQuestionIndex ?? 0
    ] as QuestionEntry | undefined;
  }, [activeQuestionnaire, currentQuestionIndex]);

  // Get all completed questions
  const numCompletedQuestions = currentQuestionIndex ?? 0;
  const completedQuestions = useMemo<QuestionEntry[]>(() => {
    if (!activeQuestionnaire?.questions) return [];

    const allQuestions = Object.entries(activeQuestionnaire.questions);
    return allQuestions.slice(0, numCompletedQuestions) as QuestionEntry[];
  }, [activeQuestionnaire, numCompletedQuestions]);

  // Determine if current question is multiSelect or radioButton
  const isMultiSelectOrRadio =
    activeQuestionEntry &&
    (activeQuestionEntry[1].fieldType === 'multiSelect' ||
      activeQuestionEntry[1].fieldType === 'radioButton');

  // Use the custom hook to manage the question icon line
  useQuestionIconLine(
    questionIconRef as React.RefObject<HTMLDivElement>,
    questionIconLineRef,
    spacerRef,
  );

  return (
    <div
      ref={componentRef}
      className='relative flex flex-1 flex-col gap-4 transition-all duration-300 ease-in-out'
    >
      <CompletedQuestions questions={completedQuestions} />

      <div className='relative'>
        <span className='absolute opacity-0' ref={nextCompletionIconRef}>
          <CompletionIcon />
        </span>
      </div>

      <div ref={spacerRef} className='flex-1' />

      <CurrentQuestion
        questionEntry={activeQuestionEntry}
        questionIconRef={questionIconRef as React.RefObject<HTMLDivElement>}
        questionLabelRef={questionLabelRef}
      />

      <div className='relative transition-all duration-300 ease-in-out'>
        <MultiSelectAnswers
          questionEntry={activeQuestionEntry}
          answersRef={multiSelectAnswersRef}
        />

        <TextAnswers
          answerRowRef={answerRowRef}
          isMultiSelectOrRadio={!!isMultiSelectOrRadio}
        />
      </div>

      <div
        ref={questionIconLineRef}
        className='aucctus-border-primary absolute left-[1.4rem] top-[-18px] z-[1] h-10 w-10 border-l-[2px]'
      />

      <PointerEventMask showMask={showMask} />
    </div>
  );
};

export default QuestionDisplay;
