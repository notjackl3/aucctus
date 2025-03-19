import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CompletionIcon } from './CompletionIcon';
import { useQuestionTransition } from '../../hooks/question-transition.hook';
import { useQuestionIconLine } from '../../hooks/question-icon-line.hook';
import CompletedQuestions from './CompletedQuestions';
import MultiSelectAnswers from '../answer/MultiSelectAnswers';
import TextAnswers from '../answer/TextAnswers';
import CurrentQuestion from './CurrentQuestion';
import { PointerEventMask } from '../util/PointerEventMask';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';
import ReadyToGenerate from '../ready-to-generate/ReadyToGenerate';
import ContinueRefining from '../continue-refining/ContinueRefining';
import { animated, useTransition } from 'react-spring';
import { cn } from '@libs/utils/react';
import {
  ConceptIncubationClarifyingQuestion,
  ConceptIncubationQuestion,
} from '@libs/api/types/conceptSeedQuestionnaire';
import { useDispatchIncubationAnimation } from '../../hooks/incubation-animation-event.hook';

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
        <span className='flex flex-col gap-4'>
          <CurrentQuestion
            questionIconRef={questionIconRef}
            questionLabelRef={questionLabelRef}
            question={question}
            iconVariant={icon as IconVariant}
          />

          <div className='relative transition-all duration-300 ease-in-out'>
            <MultiSelectAnswers answersRef={multiSelectAnswersRef} />
            <TextAnswers answerRowRef={answerRowRef} />
          </div>
        </span>
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

  useEffect(() => {
    const component = componentRef.current;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === component) {
          const viewportHeight = window.innerHeight;
          const componentRect = component.getBoundingClientRect();
          const maxHeight = viewportHeight - componentRect.top;
          const padding = 20;
          component.style.maxHeight = `${maxHeight - padding}px`;
        }
      }
    });

    if (component) {
      resizeObserver.observe(component);
    }

    return () => {
      if (component) {
        resizeObserver.unobserve(component);
      }
    };
  }, [componentRef]);

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
