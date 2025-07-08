import images from '@assets/img';
import {
  useConceptGeneration,
  useGenerateConceptIncubationClarifyingQuestions,
  useSaveGeneratedConcepts,
} from '@hooks/query/concepts.hook';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import { IGeneratedConcept } from '@libs/api/types';
import { useConceptGenerationStore } from '@stores/concept-generation.store';
import { AnswerItem } from '@stores/concept-incubation/actions';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  animationStyles,
  getAnimationStyle,
} from '../UserExploration/components/util/animation-keyframes';
import LoadingMask from '../UserExploration/components/util/LoadingMask';
import { PointerEventMask } from '../UserExploration/components/util/PointerEventMask';
import ConceptGenerationInput from './ConceptGenerationInput';
import ConceptSelectionHeader from './ConceptSelectionHeader';
import PromptAnswers from './PromptAnswers';
import SelectableConcept from './SelectableConcept';
import SelectedConcept from './SelectedConcept';
import SelectedConceptFooter from './SelectedConceptFooter';
import { toast } from '@components';
import telemetry from '@libs/telemetry';

declare const FEATURE_POST_CONCEPT_CLARIFYING_QUESTIONS: boolean;

// Constants
const mainStyle = {
  backgroundImage: `url(${images.aiExplorationsBackground})`,
  backgroundSize: 'cover',
  animation: 'moveBackground 30s ease infinite',
};

// Type definitions
interface ConceptSelectionProps {
  className?: string;
}

// Main component
const ConceptSelection: React.FC<ConceptSelectionProps> = ({
  className = '',
}) => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // Store connections
  const { draftSeedUuid } = useConceptIncubationStore();
  const {
    generatedConcepts,
    clearGeneratedConceptsBySeedUuid,
    setGeneratedConcepts,
  } = useConceptGenerationStore();

  const regenerations = useRef<number>(0);

  // Derived state from store
  const currentGeneratedConcepts = useMemo(() => {
    return [...(generatedConcepts[draftSeedUuid] || [])].sort((a, b) => {
      // Sort by generation order (newest first)
      if (a.generationOrder !== b.generationOrder) {
        return (b.generationOrder ?? 0) - (a.generationOrder ?? 0);
      }

      // If same generation order, sort alphabetically by title
      return (a.title ?? '').localeCompare(b.title ?? '');
    });
  }, [generatedConcepts, draftSeedUuid]);

  // Local state
  const [showMask, setShowMask] = useState(false);
  const [isGeneratingMoreConcepts, setIsGeneratingMoreConcepts] =
    useState(false);
  const [
    isGenerateClarifyingQuestionsLoading,
    setIsGenerateClarifyingQuestionsLoading,
  ] = useState(false);
  const [activeConcept, setActiveConcept] = useState<IGeneratedConcept>(
    () => currentGeneratedConcepts[0] || null,
  );
  const [selectedConcepts, setSelectedConcepts] = useState<IGeneratedConcept[]>(
    [],
  );
  const [inputValue, setValue] = useState<string>('');
  const [promptAnswers, setPromptAnswers] = useState<AnswerItem[]>([]);

  // API mutations
  const { mutate: generateConcept } = useConceptGeneration(draftSeedUuid);
  const { mutate: saveGeneratedConcepts, isLoading: isSaving } =
    useSaveGeneratedConcepts(draftSeedUuid);
  const { mutateAsync: generateClarifyingQuestions } =
    useGenerateConceptIncubationClarifyingQuestions();

  // Derived state
  const allowAddAnswer = useMemo(() => {
    return !(
      promptAnswers.find(
        (promptAnswer) => promptAnswer.answer === inputValue,
      ) || promptAnswers.length > 0
    );
  }, [promptAnswers, inputValue]);

  const isLoading = useMemo(
    () =>
      isSaving ||
      isGenerateClarifyingQuestionsLoading ||
      isGeneratingMoreConcepts,
    [isSaving, isGenerateClarifyingQuestionsLoading, isGeneratingMoreConcepts],
  );

  const loadingMessage = useMemo(() => {
    if (isGeneratingMoreConcepts) {
      return 'Generating more concepts...';
    } else if (isGenerateClarifyingQuestionsLoading) {
      return 'Generating clarifying questions...';
    } else {
      return undefined;
    }
  }, [isGeneratingMoreConcepts, isGenerateClarifyingQuestionsLoading]);

  // Socket event handlers
  useSocketEvent('stream.structured.concept.generation', (data) => {
    const { concepts: eventConcepts } = data?.content ?? {};

    if ('done' === data.stage && eventConcepts) {
      // Deduplicate concepts by uuid before setting them
      const newConcepts = (eventConcepts as IGeneratedConcept[]).map(
        (concept) => ({ ...concept, generationOrder: regenerations.current }),
      );

      telemetry.log('websocket.concept.generation.final_concepts', newConcepts);

      const existingConcepts = generatedConcepts[draftSeedUuid] || [];
      const uniqueConcepts = new Set([...existingConcepts, ...newConcepts]);

      setPromptAnswers([]);
      setValue('');

      setGeneratedConcepts(draftSeedUuid, Array.from(uniqueConcepts));
      setIsGeneratingMoreConcepts(false);

      telemetry.log(
        'websocket.concept.generation.state_updated',
        Array.from(uniqueConcepts),
      );
    } else {
      telemetry.log('websocket.concept.generation.intermediate_stage', {
        stage: data?.stage,
        content: data?.content,
      });
    }
  });

  // Animation handlers
  const handleLeaveAnimation = useCallback((callback: () => void) => {
    const container = containerRef.current;

    setShowMask(true);

    if (container) {
      container.addEventListener(
        'animationend',
        () => {
          setShowMask(false);
          callback();
        },
        { once: true },
      );
      container.style.animation = 'fadeScaleOut 300ms ease-out forwards';
    } else {
      setShowMask(false);
      callback();
    }
  }, []);

  // Event handlers
  const handleAddAnswer = useCallback(
    (answer: string) => {
      if (!allowAddAnswer) return;
      setPromptAnswers([...promptAnswers, { answer, uuid: uuidv4() }]);
      setValue('');
    },
    [promptAnswers, allowAddAnswer],
  );

  const handleSelectConcept = useCallback(
    (concept: IGeneratedConcept) => {
      if (selectedConcepts.some((c) => c.uuid === concept.uuid)) {
        setSelectedConcepts(
          selectedConcepts.filter((c) => c.uuid !== concept.uuid),
        );
      } else {
        setSelectedConcepts([...selectedConcepts, concept]);
      }
    },
    [selectedConcepts],
  );

  const handleClose = useCallback(() => {
    handleLeaveAnimation(() => {
      clearGeneratedConceptsBySeedUuid(draftSeedUuid);
      setSelectedConcepts([]);
      const event = new CustomEvent('aucctus-generate-concept', {
        detail: { revert: true },
      });
      window.dispatchEvent(event);
    });
  }, [handleLeaveAnimation, draftSeedUuid, clearGeneratedConceptsBySeedUuid]);

  const generateClarifyingQuestionsForConcepts = useCallback(
    async (concepts: IGeneratedConcept[]): Promise<IGeneratedConcept[]> => {
      const updatedConcepts = [...concepts];

      setIsGenerateClarifyingQuestionsLoading(true);

      await Promise.all(
        concepts.map(async (concept) => {
          const clarifyingQuestions = await generateClarifyingQuestions({
            seedUuid: draftSeedUuid || '',
            conceptUuid: concept.uuid,
          });

          const conceptToUpdate = updatedConcepts.find(
            (c) => c.uuid === concept.uuid,
          );
          if (conceptToUpdate) {
            conceptToUpdate.clarifyingQuestions = clarifyingQuestions;
          }
        }),
      );

      setIsGenerateClarifyingQuestionsLoading(false);
      return updatedConcepts;
    },
    [draftSeedUuid, generateClarifyingQuestions],
  );

  const showSuccessAndNavigate = useCallback(() => {
    handleLeaveAnimation(() => {
      toast.success(
        'Concepts saved successfully',
        FEATURE_POST_CONCEPT_CLARIFYING_QUESTIONS
          ? 'Proceeding to the refinement step.'
          : 'Report generation started.',
        {
          autoClose: 2000,
          hideProgressBar: true,
          pauseOnHover: false,
        },
      );
      setTimeout(() => {
        const event = new CustomEvent('aucctus-generate-concept', {
          detail: {
            refine: FEATURE_POST_CONCEPT_CLARIFYING_QUESTIONS,
            generate: !FEATURE_POST_CONCEPT_CLARIFYING_QUESTIONS,
          },
        });
        window.dispatchEvent(event);
      }, 1000);
    });
  }, [handleLeaveAnimation]);

  const handleSave = useCallback(() => {
    // Get the latest versions of selected concepts from the store
    const latestSelectedConcepts = selectedConcepts.map((selectedConcept) => {
      const latestVersion = currentGeneratedConcepts.find(
        (concept) => concept.uuid === selectedConcept.uuid,
      );
      return latestVersion || selectedConcept; // Fallback to original if not found
    });

    saveGeneratedConcepts(latestSelectedConcepts, {
      onSuccess: (createdConcepts) => {
        telemetry.log('save.concepts.response', createdConcepts);
        setGeneratedConcepts(draftSeedUuid, createdConcepts);

        handleLeaveAnimation(() => {
          toast.success('Concepts saved successfully', '', {
            autoClose: 2000,
            hideProgressBar: true,
            pauseOnHover: false,
          });
          setTimeout(() => {
            const event = new CustomEvent('aucctus-save-concept');
            window.dispatchEvent(event);
          }, 1000);
        });
      },
    });
  }, [
    selectedConcepts,
    currentGeneratedConcepts,
    saveGeneratedConcepts,
    draftSeedUuid,
    setGeneratedConcepts,
    handleLeaveAnimation,
  ]);

  const handleContinue = useCallback(() => {
    // Get the latest versions of selected concepts from the store
    const latestSelectedConcepts = selectedConcepts.map((selectedConcept) => {
      const latestVersion = currentGeneratedConcepts.find(
        (concept) => concept.uuid === selectedConcept.uuid,
      );
      return latestVersion || selectedConcept; // Fallback to original if not found
    });

    saveGeneratedConcepts(latestSelectedConcepts, {
      onSuccess: async (createdConcepts) => {
        telemetry.log('save.concepts.response', createdConcepts);

        if (FEATURE_POST_CONCEPT_CLARIFYING_QUESTIONS) {
          const updatedConcepts =
            await generateClarifyingQuestionsForConcepts(createdConcepts);
          setGeneratedConcepts(draftSeedUuid, updatedConcepts);
        } else {
          setGeneratedConcepts(draftSeedUuid, createdConcepts);
        }
        showSuccessAndNavigate();
      },
    });
  }, [
    selectedConcepts,
    currentGeneratedConcepts,
    saveGeneratedConcepts,
    generateClarifyingQuestionsForConcepts,
    showSuccessAndNavigate,
    draftSeedUuid,
    setGeneratedConcepts,
  ]);

  const doGenerateMoreConcepts = useCallback(() => {
    if (!allowAddAnswer) return;
    handleAddAnswer(inputValue);
    regenerations.current++;
    generateConcept({
      concepts: currentGeneratedConcepts,
      user_generation_instructions: inputValue,
    });
    setIsGeneratingMoreConcepts(true);
  }, [
    currentGeneratedConcepts,
    generateConcept,
    allowAddAnswer,
    inputValue,
    handleAddAnswer,
  ]);

  // UI rendering functions
  const renderConceptSelection = useCallback(
    () => (
      <div className='relative flex h-full flex-[2] flex-col gap-2'>
        <div className='no-scrollbar flex-1 overflow-y-auto pr-2'>
          {currentGeneratedConcepts.map((concept) => (
            <SelectableConcept
              key={concept.uuid}
              className='animate-expand'
              isActive={activeConcept?.uuid === concept.uuid}
              isSelected={selectedConcepts.some((c) => c.uuid === concept.uuid)}
              concept={concept}
              onClick={() => setActiveConcept(concept)}
              onSelect={() => handleSelectConcept(concept)}
            />
          ))}
        </div>

        <PromptAnswers promptAnswers={promptAnswers} />

        <div className='sticky bottom-0 m-2'>
          <ConceptGenerationInput
            value={inputValue}
            onChange={(e) => setValue(e.target.value)}
            onAddAnswer={doGenerateMoreConcepts}
            allowAddAnswer={allowAddAnswer}
          />
        </div>
      </div>
    ),
    [
      currentGeneratedConcepts,
      activeConcept,
      selectedConcepts,
      handleSelectConcept,
      promptAnswers,
      inputValue,
      allowAddAnswer,
      doGenerateMoreConcepts,
    ],
  );

  // Main render
  return (
    <>
      <style>{animationStyles}</style>
      <div className={className} style={mainStyle}>
        <div
          ref={containerRef}
          style={getAnimationStyle('fadeScaleIn', 1000)}
          className='aucctus-bg-secondary m-8 flex max-h-[calc(100vh-4rem)] flex-1 flex-col rounded-xl p-4'
        >
          <ConceptSelectionHeader onClose={handleClose} />
          <div className='mt-4 flex flex-1 flex-row gap-2 overflow-hidden'>
            {renderConceptSelection()}
            <div className='aucctus-bg-primary border-brand-primary flex flex-[5] flex-col gap-2 rounded-xl border-2'>
              <SelectedConcept
                activeConcept={activeConcept}
                isSelected={selectedConcepts.some(
                  (c) => c.uuid === activeConcept?.uuid,
                )}
                onSelect={handleSelectConcept}
              />
              <span className='flex flex-1' />
              <SelectedConceptFooter
                selectedConcepts={selectedConcepts}
                currentGeneratedConcepts={currentGeneratedConcepts}
                onContinue={handleContinue}
                onSave={handleSave}
              />
            </div>
          </div>
        </div>
      </div>
      <PointerEventMask showMask={showMask} />
      <LoadingMask isLoading={isLoading} message={loadingMessage} />
    </>
  );
};

export default ConceptSelection;
