import React from 'react';
import { Icon } from '@components';
import { IGeneratedConcept } from '@libs/api/types';
import { capitalize, numberToWord, pluralize } from '@libs/utils/string';

interface SelectedConceptFooterProps {
  selectedConcepts: IGeneratedConcept[];
  currentGeneratedConcepts: IGeneratedConcept[];
  onContinue: () => void;
}

const SelectedConceptFooter: React.FC<SelectedConceptFooterProps> = ({
  selectedConcepts,
  currentGeneratedConcepts,
  onContinue,
}) => {
  const selectedCount = selectedConcepts.length;
  const allConceptsSelected = selectedCount === currentGeneratedConcepts.length;
  const hasSelections = selectedCount > 0;

  const selectionText = `${capitalize(numberToWord(selectedCount, 'No'))} ${pluralize('Concept', selectedCount)} selected`;
  const instructionText = allConceptsSelected
    ? 'Continue to generation'
    : 'Select more concepts or continue to generation';

  return (
    <div className='aucctus-border-primary m-2 flex flex-row rounded-xl border-2'>
      <div className='m-4 self-center'>
        <button className='btn btn-light pointer-events-none aspect-square !p-0'>
          <Icon variant='cube' height={30} width={30} />
        </button>
      </div>
      <div className='m-4 flex flex-col'>
        <span className='aucctus-text-primary aucctus-text-sm-medium'>
          {selectionText}
        </span>
        <span className='aucctus-text-secondary aucctus-text-sm line-clamp-1'>
          {instructionText}
        </span>
      </div>
      <span className='flex flex-1' />
      <div className='m-4 self-center'>
        <button
          disabled={!hasSelections}
          className='btn btn-primary'
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SelectedConceptFooter;
