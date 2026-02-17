import { FunctionComponent, useCallback, useMemo } from 'react';
import { Modal } from '@components';
import { useModal } from '@context/ModalContextProvider';
import { useGeneratePocPlan } from '@hooks/query/pocPlan.hook';
import { ConceptStatus, IConcept } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { ArrowRight, Rocket } from 'lucide-react';

// Statuses that can proceed to POC
const PRE_POC_STATUSES: ConceptStatus[] = [
  'ideating',
  'inReview',
  'prototyping',
];

interface IProceedToPocButtonProps {
  concept: IConcept;
  onGenerationStart?: () => void;
}

const ProceedToPocButton: FunctionComponent<IProceedToPocButtonProps> = ({
  concept,
  onGenerationStart,
}) => {
  const { openModal } = useModal();
  const { generatePocPlan, isGenerating } = useGeneratePocPlan();

  // Only show button for pre-POC statuses
  const shouldShow = useMemo(() => {
    return (
      PRE_POC_STATUSES.includes(concept.status) && !concept.isHistoricalVersion
    );
  }, [concept.status, concept.isHistoricalVersion]);

  const handleProceed = useCallback(() => {
    generatePocPlan({
      conceptUuid: concept.uuid,
    });
    onGenerationStart?.();
  }, [generatePocPlan, concept.uuid, onGenerationStart]);

  const handleClick = useCallback(() => {
    openModal(
      Modal.ProceedToPoc,
      {
        conceptTitle: concept.title,
        conceptUuid: concept.uuid,
        conceptIdentifier: concept.identifier,
        onProceed: handleProceed,
      },
      {
        position: 'center',
        shouldCloseOnOverlayClick: true,
        shouldCloseOnEscape: true,
      },
    );
  }, [
    openModal,
    concept.title,
    concept.uuid,
    concept.identifier,
    handleProceed,
  ]);

  if (!shouldShow) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      disabled={isGenerating}
      className={cn(
        'fixed bottom-8 right-8 z-40',
        'flex items-center gap-3 px-6 py-4',
        'rounded-full shadow-xl',
        'bg-gradient-to-r from-primary-600 to-primary-700',
        'font-semibold text-white',
        'transition-all duration-300 ease-out',
        'hover:scale-105 hover:shadow-2xl',
        'hover:from-primary-500 hover:to-primary-600',
        'active:scale-100',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
        'animate-fade-in',
      )}
      aria-label='Proceed to Proof of Concept'
    >
      <Rocket
        className={cn(
          'h-5 w-5 stroke-current',
          isGenerating && 'animate-pulse',
        )}
      />
      <span className='aucctus-text-md-semibold'>
        {isGenerating ? 'Starting...' : 'Proceed to POC'}
      </span>
      <ArrowRight className='h-4 w-4 stroke-current' />
    </button>
  );
};

export default ProceedToPocButton;
