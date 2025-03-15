import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Card, Loading } from '@components';
import {
  useConceptIgnitionQuestionnaire,
  useConceptSeedDraft,
  useDeleteConceptSeedDraft,
} from '@hooks/query/concepts.hook';
import {
  ExpandAnExistingIdeaQuestions,
  IConceptIgnitionQuestionnaireSection,
  IdentifyNewOpportunitiesQuestions,
} from '@libs/api/types/conceptSeedQuestionnaire';
import { cn } from '@libs/utils/react';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';
import { useState } from 'react';
import { animated, easings, useTransition } from '@react-spring/web';
import ConceptGeneration from '@components/Card/ConceptGeneration/Generation/ConceptGeneration';
import { toast } from 'react-toastify';
import ConceptSelection from '@components/Card/ConceptGeneration/Generation/ConceptSelection';

type ConceptGenerationState =
  | 'pre-generation'
  | 'generating'
  | 'selecting'
  | 'post-generation';

interface IncubateConceptProps {
  initialDraftSeedUuid?: string;
}

export type QuestionnaireSection =
  | IConceptIgnitionQuestionnaireSection<ExpandAnExistingIdeaQuestions>
  | IConceptIgnitionQuestionnaireSection<IdentifyNewOpportunitiesQuestions>;

const IncubateConcept: React.FC<IncubateConceptProps> = ({
  initialDraftSeedUuid,
}) => {
  const conceptGenerationRef = useRef<HTMLDivElement>(null);

  const [conceptGenerationState, setConceptGenerationState] =
    useState<ConceptGenerationState>('pre-generation');
  const [pregenToGenAnimationComplete, setPregenToGenAnimationComplete] =
    useState(false);
  const userExplorationRef = useRef<HTMLDivElement>(null);

  // Data Fetching & Store Access
  const { isLoading: isSeedLoading } =
    useConceptSeedDraft(initialDraftSeedUuid);
  const { isLoading: isQuestionnaireLoading } =
    useConceptIgnitionQuestionnaire();
  const { mutate: deleteDraft } = useDeleteConceptSeedDraft();
  const {
    currentQuestionOrder,
    draftSeedUuid,
    submittedAnswers,
    resetQuestionnaire,
  } = useConceptIncubationStore();

  const hasSubmittedAnswers = useMemo(
    () => submittedAnswers.length > 0,
    [submittedAnswers],
  );

  // Draft Management
  const latestValuesRef = useRef({
    draftSeedUuid,
    submittedAnswers,
    deleteDraft,
    resetQuestionnaire,
  });

  useEffect(() => {
    latestValuesRef.current = {
      draftSeedUuid,
      submittedAnswers,
      deleteDraft,
      resetQuestionnaire,
    };
  }, [draftSeedUuid, submittedAnswers, deleteDraft, resetQuestionnaire]);

  const deleteAnswerlessDraft = useCallback(() => {
    const { draftSeedUuid, submittedAnswers, deleteDraft, resetQuestionnaire } =
      latestValuesRef.current;

    if (submittedAnswers.length === 0 && draftSeedUuid) {
      deleteDraft(draftSeedUuid, {
        onSuccess: () => resetQuestionnaire(),
        onError: (error) => {
          console.error('Failed to delete draft: ', error);
          resetQuestionnaire();
        },
      });
    }
  }, []);

  useEffect(() => {
    return () => deleteAnswerlessDraft();
  }, [deleteAnswerlessDraft]);

  // Concept Generation Event Handling
  useEffect(() => {
    const handleGenerateConcept = (event?: Event) => {
      const customEvent = event as
        | CustomEvent<{ revert?: boolean }>
        | undefined;

      if (customEvent?.detail?.revert) {
        setConceptGenerationState('pre-generation');
        setPregenToGenAnimationComplete(false);
        toast.error(
          'An error occurred while generating the concept. Please try again.',
        );
        return;
      }

      if (hasSubmittedAnswers) {
        const userExplorationElement = userExplorationRef.current;

        if (userExplorationElement) {
          userExplorationElement.addEventListener(
            'transitionend',
            () => {
              setConceptGenerationState('generating');
            },
            { once: true },
          );

          userExplorationElement.classList.replace('opacity-1', 'opacity-0');
        } else {
          setConceptGenerationState('generating');
        }
      }
    };

    window.addEventListener('aucctus-generate-concept', handleGenerateConcept);
    return () =>
      window.removeEventListener(
        'aucctus-generate-concept',
        handleGenerateConcept,
      );
  }, [hasSubmittedAnswers]);

  // Animation Transitions
  const userExplorationTransition = useTransition(
    conceptGenerationState === 'pre-generation',
    {
      from: { opacity: 0, maxWidth: '0px' },
      enter: { opacity: 1, maxWidth: '3000px' },
      leave: { opacity: 0, maxWidth: '0px', overflow: 'hidden' },
      config: { duration: 300, easing: easings.easeInOutSine },
    },
  );

  const aiExplorationTransition = useTransition(
    conceptGenerationState === 'pre-generation',
    {
      enter: { width: '35%' },
      leave: { width: '100%' },
      config: { duration: 300, easing: easings.easeInOutSine },
      onRest: () => {
        if (conceptGenerationState === 'generating') {
          setPregenToGenAnimationComplete(true);
        }
      },
    },
  );

  const handleBeginConceptSelection = useCallback(() => {
    const conceptGenerationElement = conceptGenerationRef.current;

    if (conceptGenerationElement) {
      conceptGenerationElement.addEventListener(
        'transitionend',
        () => {
          setConceptGenerationState('selecting');
        },
        { once: true },
      );

      conceptGenerationElement.classList.remove('rounded-xl', 'p-4', 'mr-4');
    } else {
      setConceptGenerationState('selecting');
    }
  }, []);

  // Render Functions
  const renderPreGeneration = useCallback(() => {
    return (
      <>
        {userExplorationTransition(
          (style, show) =>
            show && (
              <animated.span style={style} className={cn('flex-1')}>
                <Card.UserExplorationCard
                  ref={userExplorationRef}
                  className='ease opacity-1 ml-4 h-full flex-1 p-4 transition-all duration-300'
                />
              </animated.span>
            ),
        )}

        {aiExplorationTransition(
          (style, show) =>
            show && (
              <animated.span
                style={style}
                className={cn('transition-all duration-300', {
                  '!w-[35%]':
                    currentQuestionOrder !== undefined &&
                    conceptGenerationState === 'pre-generation',
                  '!w-[50%]':
                    currentQuestionOrder === undefined &&
                    conceptGenerationState === 'pre-generation',
                  '!w-[100%]': conceptGenerationState === 'generating',
                })}
              >
                <Card.AiExplorationsCard className='ease mr-4 h-full flex-1 p-4 transition-all duration-300' />
              </animated.span>
            ),
        )}
      </>
    );
  }, [
    userExplorationTransition,
    aiExplorationTransition,
    conceptGenerationState,
    currentQuestionOrder,
  ]);

  const renderConceptGeneration = useCallback(
    (className: string) => {
      return (
        <ConceptGeneration
          ref={conceptGenerationRef}
          className={className}
          onGenerateComplete={handleBeginConceptSelection}
        />
      );
    },
    [handleBeginConceptSelection],
  );

  const renderConceptSelection = useCallback((className: string) => {
    return <ConceptSelection className={className} />;
  }, []);

  if (isSeedLoading || isQuestionnaireLoading) {
    return <Loading />;
  }

  return (
    <div
      className={cn(
        'no-scrollbar ease flex h-[100vh] flex-row transition-all duration-300',
        {
          'p-8': conceptGenerationState !== 'selecting',
        },
      )}
    >
      {renderPreGeneration()}
      {conceptGenerationState === 'generating' &&
        pregenToGenAnimationComplete &&
        renderConceptGeneration(
          'flex flex-col rounded-xl flex-1 ease h-full p-4 transition-all duration-300 mr-4',
        )}
      {conceptGenerationState === 'selecting' &&
        renderConceptSelection(
          'flex flex-col flex-1 ease h-full transition-all duration-300',
        )}
    </div>
  );
};

export default IncubateConcept;
