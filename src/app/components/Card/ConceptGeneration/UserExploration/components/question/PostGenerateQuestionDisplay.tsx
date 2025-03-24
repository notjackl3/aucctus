import { Icon } from '@components';
import { useConceptUpdate } from '@hooks/query/concepts.hook';
import { IClarifyingQuestion } from '@libs/api/types/conceptSeedQuestionnaire';
import { cn } from '@libs/utils/react';
import { AppPath } from '@routes/routes';
import { useConceptGenerationStore } from '@stores/concept-generation.store';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatchIncubationAnimation } from '../../hooks/incubation-animation-event.hook';
import { useQuestionIconLine } from '../../hooks/question-icon-line.hook';
import { useQuestionTransition } from '../../hooks/question-transition.hook';
import { useObserveResizeQuestion } from '../../hooks/use-observe-resize-question';
import ContinueRefining from '../continue-refining/ContinueRefining';
import ReadyToGenerate from '../ready-to-generate/ReadyToGenerate';
import LoadingMask from '../util/LoadingMask';
import { PointerEventMask } from '../util/PointerEventMask';
import Question from './Question';

interface PostGenerateQuestionDisplayProps {}

interface NextConceptButtonProps {
  onClick: () => void;
  disabled: boolean;
}

interface PreviousConceptButtonProps {
  onClick: () => void;
  disabled: boolean;
}

interface ConceptCounterProps {
  currentIndex: number;
  totalConcepts: number;
}

const ConceptCounter: React.FC<ConceptCounterProps> = ({
  currentIndex,
  totalConcepts,
}) => {
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary aucctus-text-secondary aucctus-text-sm-semibold fixed right-4 top-20 z-[1000] rounded-lg border-2 p-2'>
      <span className='aucctus-text-primary'>
        {currentIndex + 1} of {totalConcepts}
      </span>
    </div>
  );
};

const PreviousConceptButton: React.FC<PreviousConceptButtonProps> = ({
  onClick,
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'btn btn-light fixed left-5 top-1/2 z-[1000] flex h-10 w-10 -translate-y-1/2 cursor-pointer shadow-xl transition-all duration-300 hover:scale-110 active:scale-95',
        { hidden: disabled },
      )}
      aria-label='Previous concept'
    >
      <span className='flex items-center justify-center'>
        <Icon variant='arrowleft' width={20} height={20} />
      </span>
    </button>
  );
};

const NextConceptButton: React.FC<NextConceptButtonProps> = ({
  onClick,
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'btn btn-light fixed right-5 top-1/2 z-[1000] flex h-10 w-10 -translate-y-1/2 cursor-pointer shadow-xl transition-all duration-300 hover:scale-110 active:scale-95',
        { hidden: disabled },
      )}
      aria-label='Next concept'
    >
      <span className='flex items-center justify-center'>
        <Icon variant='arrowright' width={20} height={20} />
      </span>
    </button>
  );
};

/**
 * Main QuestionDisplay component
 * Orchestrates the display of questions and answers in the concept generation flow
 */
const PostGenerateQuestionDisplay: React.FC<
  PostGenerateQuestionDisplayProps
> = ({}) => {
  const questionIconLineRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLSpanElement>(null);
  const navigate = useNavigate();

  const { dispatchAnimationEvent } = useDispatchIncubationAnimation();

  const {
    showMask,
    questionIconRef,
    questionLabelRef,
    componentRef,
    answerRowRef,
    multiSelectAnswersRef,
  } = useQuestionTransition(questionIconLineRef);

  useObserveResizeQuestion(componentRef);

  const {
    submittedAnswers,
    activeClarifyingQuestion,
    activeGeneratedConcept,
    draftSeedUuid,
    setActiveClarifyingQuestion,
    setActiveGeneratedConcept,
    resetQuestionnaire,
  } = useConceptIncubationStore();

  const {
    generatedConcepts,
    updateGeneratedConcept,
    clearGeneratedConceptsBySeedUuid,
  } = useConceptGenerationStore();

  const currentGeneratedConcepts = useMemo(() => {
    return generatedConcepts[draftSeedUuid];
  }, [generatedConcepts, draftSeedUuid]);

  const { mutate: updateConcept, isLoading: isUpdatingConcept } =
    useConceptUpdate();

  useQuestionIconLine(
    questionIconRef,
    questionIconLineRef,
    spacerRef,
    Infinity,
    activeClarifyingQuestion,
  );

  useEffect(() => {
    if (!activeGeneratedConcept && currentGeneratedConcepts.length > 0) {
      setActiveGeneratedConcept(currentGeneratedConcepts[0]);
    }
  }, [
    currentGeneratedConcepts,
    activeGeneratedConcept,
    setActiveGeneratedConcept,
  ]);

  const handleSelectClarifyingQuestion = useCallback(
    (question: IClarifyingQuestion) => {
      dispatchAnimationEvent('fade', () => {
        setActiveClarifyingQuestion(question);
      });
    },
    [dispatchAnimationEvent, setActiveClarifyingQuestion],
  );

  const [currentConceptIndex, setCurrentConceptIndex] = useState<number>(0);

  const handlePreviousConcept = useCallback(() => {
    if (currentConceptIndex > 0) {
      dispatchAnimationEvent('fade', () => {
        const prevIndex = currentConceptIndex - 1;
        setCurrentConceptIndex(prevIndex);
        setActiveGeneratedConcept(currentGeneratedConcepts[prevIndex]);
      });
    }
  }, [
    currentConceptIndex,
    currentGeneratedConcepts,
    dispatchAnimationEvent,
    setActiveGeneratedConcept,
  ]);

  const handleNextConcept = useCallback(() => {
    if (currentConceptIndex < currentGeneratedConcepts.length - 1) {
      dispatchAnimationEvent('fade', () => {
        const nextIndex = currentConceptIndex + 1;
        setCurrentConceptIndex(nextIndex);
        setActiveGeneratedConcept(currentGeneratedConcepts[nextIndex]);
      });
    }
  }, [
    currentConceptIndex,
    currentGeneratedConcepts,
    dispatchAnimationEvent,
    setActiveGeneratedConcept,
  ]);

  const handleGenerateReport = useCallback(() => {
    if (activeGeneratedConcept) {
      updateConcept(
        {
          uuid: activeGeneratedConcept.uuid,
          status: 'ideating',
        },
        {
          onSuccess: () => {
            dispatchAnimationEvent('fade', () => {
              const updatedConcept = activeGeneratedConcept;
              updatedConcept.isGenerating = true;
              setActiveGeneratedConcept(updatedConcept);
              updateGeneratedConcept(draftSeedUuid, updatedConcept);
            });
          },
          onError: () => {
            toast.error('Failed to generate report');
          },
        },
      );
    }
  }, [
    activeGeneratedConcept,
    updateConcept,
    setActiveGeneratedConcept,
    updateGeneratedConcept,
    draftSeedUuid,
    dispatchAnimationEvent,
  ]);

  useEffect(() => {
    if (activeGeneratedConcept) {
      const index = currentGeneratedConcepts.findIndex(
        (concept) => concept.uuid === activeGeneratedConcept.uuid,
      );
      if (index !== -1) {
        setCurrentConceptIndex(index);
      }
    }
  }, [activeGeneratedConcept, currentGeneratedConcepts]);

  useEffect(() => {
    if (currentGeneratedConcepts.every((concept) => concept.isGenerating)) {
      setTimeout(() => {
        resetQuestionnaire();
        clearGeneratedConceptsBySeedUuid(draftSeedUuid);
      }, 50);
      toast.success('Concept report generation successfully started');
      navigate(AppPath.ConceptBank);
    }
  }, [
    currentGeneratedConcepts,
    navigate,
    resetQuestionnaire,
    clearGeneratedConceptsBySeedUuid,
    draftSeedUuid,
  ]);

  return (
    <>
      <div
        ref={questionIconLineRef}
        className={cn(
          'aucctus-border-primary absolute left-[1.4rem] top-[40px] z-[1] h-10 w-10 border-l-[2px] p-2',
          {
            hidden: !activeClarifyingQuestion,
          },
        )}
      />
      <div
        ref={componentRef}
        className='no-scrollbar relative z-[999] flex flex-1 flex-col transition-all duration-300 ease-in-out'
      >
        {currentGeneratedConcepts.length > 1 && (
          <ConceptCounter
            currentIndex={currentConceptIndex}
            totalConcepts={currentGeneratedConcepts.length}
          />
        )}

        {currentGeneratedConcepts.length > 1 && !activeClarifyingQuestion && (
          <PreviousConceptButton
            onClick={handlePreviousConcept}
            disabled={currentConceptIndex === 0}
          />
        )}

        {currentGeneratedConcepts.length > 1 && !activeClarifyingQuestion && (
          <NextConceptButton
            onClick={handleNextConcept}
            disabled={
              currentConceptIndex === currentGeneratedConcepts.length - 1
            }
          />
        )}

        {!activeClarifyingQuestion && (
          <ReadyToGenerate
            concept={activeGeneratedConcept}
            compact={false}
            onGenerate={handleGenerateReport}
          />
        )}

        <div
          ref={spacerRef}
          className={cn('flex-1 transition-all duration-1000 ease-in-out', {
            'max-h-[100px] min-h-[100px]': !activeClarifyingQuestion,
            'max-h-[2000px]': activeClarifyingQuestion,
          })}
        />

        {activeClarifyingQuestion && (
          <Question
            ref={questionRef}
            question={activeClarifyingQuestion.question}
            icon={activeClarifyingQuestion.icon}
            questionIconRef={questionIconRef}
            questionLabelRef={questionLabelRef}
            multiSelectAnswersRef={multiSelectAnswersRef}
            answerRowRef={answerRowRef}
          />
        )}

        {!activeClarifyingQuestion &&
          activeGeneratedConcept?.clarifyingQuestions &&
          !activeGeneratedConcept.isGenerating && (
            <ContinueRefining
              iconRef={questionIconRef}
              clarifyingQuestions={activeGeneratedConcept.clarifyingQuestions}
              submittedAnswers={submittedAnswers}
              selectClarifyingQuestion={handleSelectClarifyingQuestion}
            />
          )}

        <PointerEventMask showMask={showMask} />
        <LoadingMask isLoading={isUpdatingConcept} />
      </div>
    </>
  );
};

export default PostGenerateQuestionDisplay;
