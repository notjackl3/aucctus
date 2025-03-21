import images from '@assets/img';
import { Icon } from '@components';
import {
  useGenerateConceptIncubationClarifyingQuestions,
  useSaveGeneratedConcepts,
} from '@hooks/query/concepts.hook';
import { IGeneratedConcept } from '@libs/api/types';
import { useConceptGenerationStore } from '@stores/concept-generation.store';
import {
  AnswerItem,
  useConceptIncubationStore,
} from '@stores/concept-incubation.store';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  animationStyles,
  getAnimationStyle,
} from '../UserExploration/components/util/animation-keyframes';
import LoadingMask from '../UserExploration/components/util/LoadingMask';
import { PointerEventMask } from '../UserExploration/components/util/PointerEventMask';
import { useAnswerList } from '../UserExploration/hooks/answer-list.hook';
import PromptAnswers from './PromptAnswers';
import SelectableConcept from './SelectableConcept';
import SelectedConcept from './SelectedConcept';
import SelectedConceptFooter from './SelectedConceptFooter';

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

interface ConceptSelectionHeaderProps {
  onClose: () => void;
}

// Header component
const ConceptSelectionHeader: React.FC<ConceptSelectionHeaderProps> = ({
  onClose,
}) => (
  <div className='flex flex-row items-center justify-center gap-2'>
    <span className='aucctus-text-brand-primary aucctus-text-xl-semibold'>
      Concept Selection
    </span>
    <span className='flex flex-1' />
    <button onClick={onClose} className='btn btn-light aspect-square !p-2'>
      <Icon variant='closeX' height={20} width={20} />
    </button>
  </div>
);

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
  const currentGeneratedConcepts = useMemo(
    () => generatedConcepts[draftSeedUuid],
    [generatedConcepts, draftSeedUuid],
  );

  // API mutations
  const { mutate: saveGeneratedConcepts, isLoading: isSaving } =
    useSaveGeneratedConcepts(draftSeedUuid);
  const { mutateAsync: generateClarifyingQuestions } =
    useGenerateConceptIncubationClarifyingQuestions();

  // UI state
  const [showMask, setShowMask] = useState(false);
  const [
    isGenerateClarifyingQuestionsLoading,
    setIsGenerateClarifyingQuestionsLoading,
  ] = useState(false);

  // Concept selection state
  const [activeConcept, setActiveConcept] = useState<IGeneratedConcept>(
    currentGeneratedConcepts[0],
  );
  const [selectedConcepts, setSelectedConcepts] = useState<IGeneratedConcept[]>(
    [],
  );

  // Prompt answers state
  // const [inputValue, setValue] = useState<string>('');
  const [promptAnswers, setPromptAnswers] = useState<AnswerItem[]>([]);
  const { handleUpdateAnswer, handleRemoveAnswer } = useAnswerList(
    promptAnswers,
    setPromptAnswers,
  );

  // // Derived state
  // const allowAddAnswer = useMemo(() => {
  //   return !(
  //     promptAnswers.find(
  //       (promptAnswer) => promptAnswer.answer === inputValue,
  //     ) || promptAnswers.length >= 3
  //   );
  // }, [promptAnswers, inputValue]);

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

  // // Prompt answer handlers
  // const handleAddAnswer = useCallback(
  //   (answer: string) => {
  //     if (!allowAddAnswer) return;
  //     setPromptAnswers([...promptAnswers, { answer, uuid: uuidv4() }]);
  //     setValue('');
  //   },
  //   [promptAnswers, allowAddAnswer],
  // );

  // Concept selection handlers
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

  // Navigation handlers
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

  // Extracted helper functions
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
      toast.success('Concepts saved successfully', {
        autoClose: 1000,
        hideProgressBar: true,
        pauseOnHover: false,
      });
      setTimeout(() => {
        const event = new CustomEvent('aucctus-generate-concept', {
          detail: { refine: true },
        });
        window.dispatchEvent(event);
      }, 1000);
    });
  }, [handleLeaveAnimation]);

  // Simplified handleContinue function
  const handleContinue = useCallback(() => {
    saveGeneratedConcepts(selectedConcepts, {
      onSuccess: async () => {
        const updatedConcepts =
          await generateClarifyingQuestionsForConcepts(selectedConcepts);
        setGeneratedConcepts(draftSeedUuid, updatedConcepts);
        showSuccessAndNavigate();
      },
    });
  }, [
    selectedConcepts,
    saveGeneratedConcepts,
    generateClarifyingQuestionsForConcepts,
    showSuccessAndNavigate,
    draftSeedUuid,
    setGeneratedConcepts,
  ]);

  // UI rendering functions
  const renderConceptSelection = useCallback(
    () => (
      <div className='relative flex h-full flex-[2] flex-col gap-2'>
        <div className='no-scrollbar flex-1 overflow-y-auto pr-2'>
          {currentGeneratedConcepts.map((concept) => (
            <SelectableConcept
              key={concept.uuid}
              isActive={concept.uuid === activeConcept.uuid}
              isSelected={selectedConcepts.some((c) => c.uuid === concept.uuid)}
              concept={concept}
              onClick={() => setActiveConcept(concept)}
              onSelect={() => handleSelectConcept(concept)}
            />
          ))}
        </div>

        <PromptAnswers
          promptAnswers={promptAnswers}
          handleUpdateAnswer={handleUpdateAnswer}
          handleRemoveAnswer={handleRemoveAnswer}
        />

        {/* <div className='sticky bottom-0 m-2'>
        <ConceptGenerationInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onAddAnswer={() => handleAddAnswer(value)}
          allowAddAnswer={allowAddAnswer}
        />
      </div> */}
      </div>
    ),
    [
      currentGeneratedConcepts,
      //inputValue,
      //allowAddAnswer,
      //handleAddAnswer,
      handleSelectConcept,
      promptAnswers,
      handleUpdateAnswer,
      handleRemoveAnswer,
      selectedConcepts,
      activeConcept.uuid,
    ],
  );

  const isLoading = useMemo(
    () => isSaving || isGenerateClarifyingQuestionsLoading,
    [isSaving, isGenerateClarifyingQuestionsLoading],
  );

  const loadingMessage = useMemo(
    () =>
      isGenerateClarifyingQuestionsLoading
        ? 'Generating clarifying questions...'
        : undefined,
    [isGenerateClarifyingQuestionsLoading],
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
                  (c) => c.uuid === activeConcept.uuid,
                )}
                onSelect={handleSelectConcept}
              />
              <span className='flex flex-1' />
              <SelectedConceptFooter
                selectedConcepts={selectedConcepts}
                currentGeneratedConcepts={currentGeneratedConcepts}
                onContinue={handleContinue}
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
