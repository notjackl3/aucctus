import {
  ConceptIncubationClarifyingQuestion,
  ConceptIncubationQuestion,
} from '@libs/api/types/conceptSeedQuestionnaire';
import { cn } from '@libs/utils/react';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { animated, useTransition } from 'react-spring';
import { useDispatchIncubationAnimation } from '../../hooks/incubation-animation-event.hook';
import { useQuestionIconLine } from '../../hooks/question-icon-line.hook';
import { useQuestionTransition } from '../../hooks/question-transition.hook';
import { useObserveResizeQuestion } from '../../hooks/use-observe-resize-question';
import ContinueRefining from '../continue-refining/ContinueRefining';
import ReadyToGenerate from '../ready-to-generate/ReadyToGenerate';
import { PointerEventMask } from '../util/PointerEventMask';
import CompletedQuestions from './CompletedQuestions';
import { CompletionIcon } from './CompletionIcon';
import Question from './Question';

interface QuestionDisplayProps {}

/**
 * Main QuestionDisplay component
 * Orchestrates the display of questions and answers in the concept generation flow
 */
const QuestionDisplay: React.FC<QuestionDisplayProps> = () => {
  const questionIconLineRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  const { dispatchAnimationEvent } = useDispatchIncubationAnimation();

  const {
    showMask,
    questionIconRef,
    questionLabelRef,
    nextCompletionIconRef,
    componentRef,
    answerRowRef,
    multiSelectAnswersRef,
  } = useQuestionTransition(questionIconLineRef);

  useObserveResizeQuestion(componentRef);

  const {
    currentQuestionOrder,
    submittedAnswers,
    activeQuestion,
    activeClarifyingQuestion,
    clarifyingQuestions,
    setActiveClarifyingQuestion,
    getPreviousQuestion,
  } = useConceptIncubationStore();

  useQuestionIconLine(
    questionIconRef,
    questionIconLineRef,
    spacerRef,
    currentQuestionOrder ?? 0,
    activeClarifyingQuestion,
  );

  const [isClarifyingExpanded, setIsClarifyingExpanded] = useState(false);

  useEffect(() => {
    setIsClarifyingExpanded(false);
  }, [clarifyingQuestions]);

  const previousQuestion = useMemo(
    () => getPreviousQuestion(submittedAnswers),
    [getPreviousQuestion, submittedAnswers],
  );

  const nextCompletionIconStyle = useMemo(() => {
    if (
      Math.floor(previousQuestion?.order ?? 0) ===
      Math.floor(currentQuestionOrder ?? 0)
    ) {
      return { marginTop: '-10px' };
    }
    return {};
  }, [previousQuestion, currentQuestionOrder]);

  const renderQuestion = useCallback(
    (question: ConceptIncubationQuestion, icon?: string) => {
      return (
        <Question
          question={question}
          icon={icon}
          questionIconRef={questionIconRef}
          questionLabelRef={questionLabelRef}
          multiSelectAnswersRef={multiSelectAnswersRef}
          answerRowRef={answerRowRef}
        />
      );
    },
    [questionIconRef, questionLabelRef, multiSelectAnswersRef, answerRowRef],
  );

  const renderNextCompletionIcon = useCallback(
    () => (
      <div
        className={cn('relative', {
          'mt-4': !!previousQuestion,
        })}
      >
        <span
          style={nextCompletionIconStyle}
          className='absolute opacity-0'
          ref={nextCompletionIconRef}
        >
          <CompletionIcon />
        </span>
      </div>
    ),
    [nextCompletionIconRef, nextCompletionIconStyle, previousQuestion],
  );

  const renderQuestionIconLine = useCallback(
    () => (
      <div
        ref={questionIconLineRef}
        className='aucctus-border-primary absolute left-[1.4rem] top-[40px] z-[1] h-10 w-10 border-l-[2px]'
      />
    ),
    [questionIconLineRef],
  );

  const renderSpacer = useCallback(() => {
    return (
      <div
        ref={spacerRef}
        className={cn('flex-1 transition-all duration-1000 ease-in-out', {
          'max-h-[100px] min-h-[100px]':
            !activeQuestion &&
            !activeClarifyingQuestion &&
            !isClarifyingExpanded,
          'max-h-[40px] min-h-[40px]':
            !activeQuestion &&
            !activeClarifyingQuestion &&
            isClarifyingExpanded,
          'max-h-[2000px]': activeQuestion || activeClarifyingQuestion,
        })}
      />
    );
  }, [
    activeQuestion,
    activeClarifyingQuestion,
    isClarifyingExpanded,
    spacerRef,
  ]);

  const completedQuestionsTransition = useTransition(
    previousQuestion && currentQuestionOrder !== Infinity,
    {
      from: { opacity: 1, maxHeight: '500px' },
      enter: { opacity: 1, maxHeight: '500px' },
      leave: { opacity: 0, maxHeight: '0px', delay: 500 },
      config: { tension: 100, friction: 12, mass: 0.5 },
    },
  );

  const renderCompletedQuestions = useCallback(() => {
    return completedQuestionsTransition(
      (style, item) =>
        item && (
          <animated.span style={style} className='z-[99] flex flex-col gap-4'>
            <CompletedQuestions />
          </animated.span>
        ),
    );
  }, [completedQuestionsTransition]);

  const renderReadyToGenerate = useCallback(() => {
    return (
      <ReadyToGenerate
        compact={isClarifyingExpanded}
        onMouseEnter={() => setIsClarifyingExpanded(false)}
        onGenerate={() =>
          window.dispatchEvent(new CustomEvent('aucctus-generate-concept'))
        }
      />
    );
  }, [isClarifyingExpanded]);

  const handleSelectClarifyingQuestion = useCallback(
    (question: ConceptIncubationClarifyingQuestion) => {
      dispatchAnimationEvent('fade', () => {
        setActiveClarifyingQuestion(question);
      });
    },
    [dispatchAnimationEvent, setActiveClarifyingQuestion],
  );

  const renderContinueRefining = useCallback(() => {
    return (
      <ContinueRefining
        iconRef={questionIconRef}
        clarifyingQuestions={clarifyingQuestions}
        submittedAnswers={submittedAnswers}
        onMouseEnter={() => setIsClarifyingExpanded(true)}
        selectClarifyingQuestion={handleSelectClarifyingQuestion}
      />
    );
  }, [
    questionIconRef,
    clarifyingQuestions,
    submittedAnswers,
    setIsClarifyingExpanded,
    handleSelectClarifyingQuestion,
  ]);

  return (
    <>
      {renderQuestionIconLine()}
      <div
        ref={componentRef}
        className='no-scrollbar relative z-[999] flex flex-1 flex-col transition-all duration-300 ease-in-out'
      >
        {renderCompletedQuestions()}

        {activeQuestion && renderNextCompletionIcon()}
        {!activeQuestion &&
          !activeClarifyingQuestion &&
          renderReadyToGenerate()}

        {renderSpacer()}

        {activeQuestion && renderQuestion(activeQuestion)}
        {activeClarifyingQuestion &&
          renderQuestion(
            activeClarifyingQuestion.question,
            activeClarifyingQuestion.icon,
          )}
        {!activeQuestion &&
          !activeClarifyingQuestion &&
          renderContinueRefining()}

        <PointerEventMask showMask={showMask} />
      </div>
    </>
  );
};

export default QuestionDisplay;
