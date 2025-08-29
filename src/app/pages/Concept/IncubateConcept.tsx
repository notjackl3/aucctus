import { Card } from '@components';
import ConceptGeneration from '@components/Card/ConceptGeneration/Generation/ConceptGeneration';
import ConceptSelection from '@components/Card/ConceptGeneration/Generation/ConceptSelection';
import LoadingMask from '@components/Card/ConceptGeneration/UserExploration/components/util/LoadingMask';
import {
  useConceptIncubationQuestionnaire,
  useConceptReportGenerate,
  useDeleteSeed,
  useGetConceptSeedDraftAnswers,
  useSeed,
} from '@hooks/query/concepts.hook';
import { cn } from '@libs/utils/react';
import { animated, easings, useTransition } from '@react-spring/web';
import { AppPath } from '@routes/routes';
import { useConceptGenerationStore } from '@stores/concept-generation.store';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import { IGeneratedConcept } from '@libs/api/types';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '@components';
import { useQueryClient } from 'react-query';
import { AucctusQueryKeys } from '@hooks/query/query-keys';

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
  const isBackingFromSelectionRef = useRef(false);
  const queryClient = useQueryClient();

  // Data Fetching & Store Access
  const {
    data: seedDraftData,
    isLoading: isSeedLoading,
    error: seedError,
  } = useSeed(seedUuid, { status: 'draft' });
  const { questionnaires, isLoading: isQuestionnaireLoading } =
    useConceptIncubationQuestionnaire();
  const { mutate: deleteDraft } = useDeleteSeed({ status: 'draft' });
  const { mutate: generateConceptReport } = useConceptReportGenerate();
  const {
    currentQuestionOrder,
    activeQuestionnaire,
    draftSeedUuid,
    submittedAnswers,
    resetQuestionnaire,
    setDraftSeedUuid,
    setActiveQuestionnaire,
    setCurrentQuestionOrder,
    setClarifyingQuestions,
    setIsNewSeed,
  } = useConceptIncubationStore();

  const { generatedConcepts, setGeneratedConcepts } =
    useConceptGenerationStore();

  // Fetch answers if we have a seed UUID and the seed exists
  const { isLoading: isAnswersLoading } = useGetConceptSeedDraftAnswers(
    draftSeedUuid && seedDraftData && !seedError ? draftSeedUuid : '',
  );

  const navigate = useNavigate();

  // Set isNewSeed to false when loading an existing seed from URL
  useEffect(() => {
    if (seedUuid) {
      setIsNewSeed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (seedError) {
      const status = (seedError as any)?.response?.status;
      if (status === 404) {
        // Clear the draftSeedUuid from store before navigating to prevent further API calls
        setDraftSeedUuid('');
        resetQuestionnaire();
      }
    }
  }, [seedError, resetQuestionnaire, setDraftSeedUuid]);

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
        setClarifyingQuestions(seedDraftData.clarifyingQuestions);
      } else if (
        seedDraftData.type === 'IDENTIFY_NEW_OPPORTUNITIES' &&
        questionnaires.identifyNewOpportunities.questions &&
        questionnaires.identifyNewOpportunities.type ===
          'IDENTIFY_NEW_OPPORTUNITIES'
      ) {
        setActiveQuestionnaire(questionnaires.identifyNewOpportunities);
        setClarifyingQuestions(seedDraftData.clarifyingQuestions);
      }
    }
  }, [
    seedDraftData,
    questionnaires,
    activeQuestionnaire,
    setActiveQuestionnaire,
    setClarifyingQuestions,
  ]);

  // Handle cached concepts - populate store and skip to selection
  useEffect(() => {
    if (
      seedDraftData?.cachedConcepts &&
      Array.isArray(seedDraftData.cachedConcepts) &&
      seedDraftData.cachedConcepts.length > 0 &&
      draftSeedUuid &&
      conceptGenerationState === 'pre-generation' &&
      !isBackingFromSelectionRef.current // Don't auto-skip if user is backing from selection
    ) {
      setGeneratedConcepts(draftSeedUuid, seedDraftData.cachedConcepts);
      setConceptGenerationState('selecting');
      setTimeout(() => {
        setCurrentQuestionOrder(Infinity);
      }, 100); // This is the worst hack ever, but it works
    }
  }, [
    seedDraftData,
    draftSeedUuid,
    setGeneratedConcepts,
    conceptGenerationState,
    setCurrentQuestionOrder,
  ]);

  // Determine the current question based on answers
  useEffect(() => {
    if (activeQuestionnaire && activeQuestionnaire.questions) {
      if (submittedAnswers.length > 0) {
        const highestOrderQuestion = Math.max(
          ...Object.values(activeQuestionnaire.questions).map((q) => q.order),
        );
        const highestOrderAnswer = Math.max(
          ...submittedAnswers.map((a) => a.question.order),
        );

        if (highestOrderAnswer >= highestOrderQuestion) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuestionnaire, submittedAnswers, setCurrentQuestionOrder]);

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
    const { draftSeedUuid, submittedAnswers, deleteDraft } =
      latestValuesRef.current;

    // Only delete if we have a valid draftSeedUuid, no submitted answers, and the seed actually exists
    if (
      submittedAnswers.length === 0 &&
      draftSeedUuid &&
      seedDraftData && // Only delete if we have confirmed the seed exists
      !seedError // Don't try to delete if there was an error fetching the seed
    ) {
      deleteDraft(draftSeedUuid, {
        onSuccess: () => resetQuestionnaire(),
      });
    }
  }, [resetQuestionnaire, seedDraftData, seedError]);

  const cleanup = useCallback(() => {
    deleteAnswerlessDraft();
  }, [deleteAnswerlessDraft]);

  useEffect(() => {
    // Only setup cleanup if we have a valid draft seed
    if (draftSeedUuid && !seedError) {
      return () => cleanup();
    }
  }, [cleanup, draftSeedUuid, seedError]);

  // Concept Generation Event Handling
  useEffect(() => {
    const handleGenerateConcept = (event?: Event) => {
      const customEvent = event as
        | CustomEvent<{
            revert?: boolean;
            refine?: boolean;
            generate?: boolean;
            error?: boolean;
            backToPreGeneration?: boolean;
            viewCachedConcepts?: boolean;
          }>
        | undefined;

      const revert = customEvent?.detail?.revert;
      const refine = customEvent?.detail?.refine;
      const generate = customEvent?.detail?.generate;
      const backToPreGeneration = customEvent?.detail?.backToPreGeneration;
      const viewCachedConcepts = customEvent?.detail?.viewCachedConcepts;

      if (generate) {
        // Get generated concepts from store
        if (draftSeedUuid && generatedConcepts[draftSeedUuid]?.length > 0) {
          // Generate reports for all selected concepts
          generatedConcepts[draftSeedUuid].forEach(
            (concept: IGeneratedConcept) => {
              generateConceptReport(concept.uuid, {
                onSuccess: () => {
                  // Clear generated concepts after successful generation
                  setGeneratedConcepts(
                    draftSeedUuid,
                    generatedConcepts[draftSeedUuid].map(
                      (c: IGeneratedConcept) => ({
                        ...c,
                        isGenerating: true,
                      }),
                    ),
                  );
                  queryClient.invalidateQueries({
                    queryKey: [AucctusQueryKeys.concepts],
                  });
                },
              });
            },
          );

          // Navigate to concept bank
          navigate(AppPath.ConceptBank);
        }
        return;
      }

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

      if (backToPreGeneration) {
        isBackingFromSelectionRef.current = true;
        setConceptGenerationState('pre-generation');
        setPregenToGenAnimationComplete(false);
        return;
      }

      if (viewCachedConcepts) {
        // Populate store with cached concepts before going to selection
        if (
          seedDraftData?.cachedConcepts &&
          Array.isArray(seedDraftData.cachedConcepts) &&
          seedDraftData.cachedConcepts.length > 0 &&
          draftSeedUuid
        ) {
          setGeneratedConcepts(draftSeedUuid, seedDraftData.cachedConcepts);
        }
        setConceptGenerationState('selecting'); // use this state and let the generation component handle cached concepts
        return;
      }

      if (hasSubmittedAnswers) {
        // Reset the backing flag when user starts generating concepts
        isBackingFromSelectionRef.current = false;

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

    // Save concepts handler - saves selected concepts without generating reports
    const handleSaveConcept = () => {
      // Navigate to concept bank after concepts have been saved
      navigate(AppPath.ConceptBank);
    };

    window.addEventListener('aucctus-generate-concept', handleGenerateConcept);
    window.addEventListener('aucctus-save-concept', handleSaveConcept);
    return () => {
      window.removeEventListener(
        'aucctus-generate-concept',
        handleGenerateConcept,
      );
      window.removeEventListener('aucctus-save-concept', handleSaveConcept);
    };
  }, [
    hasSubmittedAnswers,
    navigate,
    draftSeedUuid,
    generatedConcepts,
    setGeneratedConcepts,
    generateConceptReport,
    queryClient,
    seedDraftData?.cachedConcepts,
  ]);

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
    if (conceptGenerationState === 'selecting') {
      return;
    }

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
      {!(isSeedLoading || isQuestionnaireLoading || isAnswersLoading) && (
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
      )}
      <LoadingMask
        isLoading={isSeedLoading || isQuestionnaireLoading || isAnswersLoading}
      />
    </>
  );
};

export default IncubateConcept;
