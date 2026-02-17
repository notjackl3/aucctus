import { cn } from '@libs/utils/react';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
import {
  ConceptIncubationQuestion,
  IClarifyingQuestion,
} from '@libs/api/types';

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
    componentRef,
    activeClarifyingQuestion,
  );

  const [isGenerateCardExpanded, setIsGenerateCardExpanded] = useState(true);

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
            !isGenerateCardExpanded,
          'max-h-[40px] min-h-[40px]':
            !activeQuestion &&
            !activeClarifyingQuestion &&
            isGenerateCardExpanded,
          'max-h-[2000px]': activeQuestion || activeClarifyingQuestion,
        })}
      />
    );
  }, [
    activeQuestion,
    activeClarifyingQuestion,
    isGenerateCardExpanded,
    spacerRef,
  ]);

  const showCompletedQuestions =
    !!previousQuestion && currentQuestionOrder !== Infinity;

  const renderCompletedQuestions = useCallback(() => {
    return (
      <AnimatePresence>
        {showCompletedQuestions && (
          <motion.span
            initial={{ opacity: 1, maxHeight: '500px' }}
            animate={{ opacity: 1, maxHeight: '500px' }}
            exit={{
              opacity: 0,
              maxHeight: '0px',
              transition: {
                type: 'spring',
                stiffness: 100,
                damping: 12,
                mass: 0.5,
                delay: 0.5,
              },
            }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 12,
              mass: 0.5,
            }}
            className='z-[99] flex flex-col gap-4'
          >
            <CompletedQuestions />
          </motion.span>
        )}
      </AnimatePresence>
    );
  }, [showCompletedQuestions]);

  const renderReadyToGenerate = useCallback(() => {
    return (
      <ReadyToGenerate
        compact={!isGenerateCardExpanded}
        onGenerate={() =>
          window.dispatchEvent(new CustomEvent('aucctus-generate-concept'))
        }
      />
    );
  }, [isGenerateCardExpanded]);

  const handleSelectClarifyingQuestion = useCallback(
    (question: IClarifyingQuestion) => {
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
        selectClarifyingQuestion={handleSelectClarifyingQuestion}
      />
    );
  }, [
    questionIconRef,
    clarifyingQuestions,
    submittedAnswers,
    handleSelectClarifyingQuestion,
  ]);

  return (
    <>
      {renderQuestionIconLine()}
      <div
        ref={componentRef}
        className='no-scrollbar relative z-[999] flex flex-1 flex-col transition-all duration-300 ease-in-out'
        onWheel={(e) => {
          const element = componentRef.current!;
          const isScrollingUp = e.deltaY < 0;

          const atTop = element.scrollTop === 0;

          setIsGenerateCardExpanded(isScrollingUp && atTop);
        }}
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
