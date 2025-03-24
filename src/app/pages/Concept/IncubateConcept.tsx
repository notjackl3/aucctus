import { Card } from '@components';
import ConceptGeneration from '@components/Card/ConceptGeneration/Generation/ConceptGeneration';
import ConceptSelection from '@components/Card/ConceptGeneration/Generation/ConceptSelection';
import LoadingMask from '@components/Card/ConceptGeneration/UserExploration/components/util/LoadingMask';
import {
  useConceptIncubationQuestionnaire,
  useConceptSeedDraft,
  useDeleteConceptSeedDraft,
  useGetConceptSeedDraftAnswers,
} from '@hooks/query/concepts.hook';
import { cn } from '@libs/utils/react';
import { animated, easings, useTransition } from '@react-spring/web';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

type ConceptGenerationState =
  | 'pre-generation'
  | 'generating'
  | 'selecting'
  | 'selection-refinement';

const IncubateConcept: React.FC = () => {
  const [searchParams] = useSearchParams();
  const seedUuid = searchParams.get('seed') || undefined;

  const conceptGenerationRef = useRef<HTMLDivElement>(null);

  const [conceptGenerationState, setConceptGenerationState] =
    useState<ConceptGenerationState>('pre-generation');
  const [pregenToGenAnimationComplete, setPregenToGenAnimationComplete] =
    useState(false);
  const userExplorationRef = useRef<HTMLDivElement>(null);

  // Data Fetching & Store Access
  const { data: seedDraftData, isLoading: isSeedLoading } =
    useConceptSeedDraft(seedUuid);
  const { questionnaires, isLoading: isQuestionnaireLoading } =
    useConceptIncubationQuestionnaire();
  const { mutate: deleteDraft } = useDeleteConceptSeedDraft();
  const {
    currentQuestionOrder,
    activeQuestionnaire,
    draftSeedUuid,
    submittedAnswers,
    resetQuestionnaire,
    setDraftSeedUuid,
    setSubmittedAnswers,
    setActiveQuestionnaire,
    setCurrentQuestionOrder,
  } = useConceptIncubationStore();

  // Fetch answers if we have a seed UUID
  const { data: seedDraftAnswers, isLoading: isAnswersLoading } =
    useGetConceptSeedDraftAnswers(draftSeedUuid || '');

  // Update store with UUID from props if available and not already set
  useEffect(() => {
    // Check if seedDraftData exists and has a uuid
    if (
      seedDraftData &&
      'uuid' in seedDraftData &&
      typeof seedDraftData.uuid === 'string' &&
      seedDraftData.uuid !== draftSeedUuid
    ) {
      setDraftSeedUuid(seedDraftData.uuid);
    } else if (seedUuid && seedUuid !== draftSeedUuid) {
      setDraftSeedUuid(seedUuid);
    }
  }, [seedUuid, seedDraftData, draftSeedUuid, setDraftSeedUuid]);

  // Set the active questionnaire if we have seed data with a type
  useEffect(() => {
    if (
      seedDraftData &&
      'type' in seedDraftData &&
      seedDraftData.type &&
      questionnaires
    ) {
      // Check for valid questionnaire data with correct type
      if (
        seedDraftData.type === 'EXPAND_AN_EXISTING_IDEA' &&
        questionnaires.expandAnExistingIdea.questions &&
        questionnaires.expandAnExistingIdea.type === 'EXPAND_AN_EXISTING_IDEA'
      ) {
        setActiveQuestionnaire(questionnaires.expandAnExistingIdea);
      } else if (
        seedDraftData.type === 'IDENTIFY_NEW_OPPORTUNITIES' &&
        questionnaires.identifyNewOpportunities.questions &&
        questionnaires.identifyNewOpportunities.type ===
          'IDENTIFY_NEW_OPPORTUNITIES'
      ) {
        setActiveQuestionnaire(questionnaires.identifyNewOpportunities);
      }
    }
  }, [
    seedDraftData,
    questionnaires,
    activeQuestionnaire,
    setActiveQuestionnaire,
  ]);

  // Update store with answers when they are loaded
  useEffect(() => {
    if (seedDraftAnswers && seedDraftAnswers.length > 0) {
      setSubmittedAnswers(seedDraftAnswers);
    }
  }, [seedDraftAnswers, setSubmittedAnswers]);

  // Determine the current question based on answers
  useEffect(() => {
    if (
      activeQuestionnaire &&
      activeQuestionnaire.questions &&
      (!currentQuestionOrder || currentQuestionOrder === Infinity)
    ) {
      if (submittedAnswers.length > 0) {
        // Sort answers by question order to find the latest answered question
        const sortedAnswers = [...submittedAnswers].sort(
          (a, b) => b.question.order - a.question.order,
        );

        // Get the order of the last answered question
        const lastAnsweredQuestionOrder = sortedAnswers[0].question.order;

        // We need to find the next unanswered question
        const questionOrders = Object.values(activeQuestionnaire.questions)
          .map((q) => q.order)
          .filter((order) => order > lastAnsweredQuestionOrder)
          .sort((a, b) => a - b);

        if (questionOrders.length > 0) {
          // Set current question to the next question after the last answered one
          const nextQuestionOrder = questionOrders[0];
          setCurrentQuestionOrder(nextQuestionOrder);
        } else {
          // If all questions are answered, set to Infinity (questionnaire complete)
          setCurrentQuestionOrder(Infinity);
        }
      } else if (Object.values(activeQuestionnaire.questions).length > 0) {
        // If no questions answered yet, set to the first question (lowest order)
        const firstQuestionOrder = Math.min(
          ...Object.values(activeQuestionnaire.questions)
            .map((q) => q.order)
            .filter((order) => order > 0),
        );
        setCurrentQuestionOrder(firstQuestionOrder);
      }
    }
  }, [
    activeQuestionnaire,
    submittedAnswers,
    currentQuestionOrder,
    setCurrentQuestionOrder,
  ]);

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
        onError: () => {
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
        | CustomEvent<{ revert?: boolean; refine?: boolean; error?: boolean }>
        | undefined;

      const revert = customEvent?.detail?.revert;
      const refine = customEvent?.detail?.refine;

      if (revert || refine) {
        setConceptGenerationState(
          revert ? 'pre-generation' : 'selection-refinement',
        );
        setPregenToGenAnimationComplete(false);

        if (customEvent?.detail?.error) {
          toast.error(
            'An error occurred while generating the concept. Please try again.',
          );
        }

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
    ['pre-generation', 'selection-refinement'].includes(conceptGenerationState),
    {
      from: { opacity: 0, maxWidth: '0px' },
      enter: { opacity: 1, maxWidth: '3000px' },
      leave: { opacity: 0, maxWidth: '0px', overflow: 'hidden' },
      config: { duration: 300, easing: easings.easeInOutSine },
    },
  );

  const aiExplorationTransition = useTransition(
    ['pre-generation', 'selection-refinement'].includes(conceptGenerationState),
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
  const renderExploration = useCallback(() => {
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
                    !!currentQuestionOrder &&
                    ['pre-generation', 'selection-refinement'].includes(
                      conceptGenerationState,
                    ),
                  '!w-[50%]':
                    !currentQuestionOrder &&
                    ['pre-generation', 'selection-refinement'].includes(
                      conceptGenerationState,
                    ),
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

  return (
    <>
      <div
        className={cn(
          'ease flex h-[100vh] flex-row overflow-hidden transition-all duration-300',
          {
            'p-8': conceptGenerationState !== 'selecting',
          },
        )}
      >
        {renderExploration()}
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
      <LoadingMask
        isLoading={isSeedLoading || isQuestionnaireLoading || isAnswersLoading}
      />
    </>
  );
};

export default IncubateConcept;
