import React from 'react';
import { Icon } from '@components';
import { IGeneratedConcept } from '@libs/api/types';
import { capitalize, numberToWord, pluralize } from '@libs/utils/string';

interface SelectedConceptFooterProps {
  selectedConcepts: IGeneratedConcept[];
  currentGeneratedConcepts: IGeneratedConcept[];
  onContinue: () => void;
  onSave?: () => void;
}

const SelectedConceptFooter: React.FC<SelectedConceptFooterProps> = ({
  selectedConcepts,
  currentGeneratedConcepts,
  onContinue,
  onSave,
}) => {
  const selectedCount = selectedConcepts.length;
  const allConceptsSelected = selectedCount === currentGeneratedConcepts.length;
  const hasSelections = selectedCount > 0;

  const selectionText = `${capitalize(numberToWord(selectedCount, 'No'))} ${pluralize('Concept', selectedCount)} selected`;
  const instructionText = allConceptsSelected
    ? 'Continue to generation'
    : 'Select more concepts or continue to generation';

  return (
    <div className='aucctus-border-primary aucctus-bg-primary m-2 flex flex-row rounded-xl border-2'>
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
      <div className='m-4 flex flex-row gap-2 self-center'>
        <button
          disabled={!hasSelections}
          className='btn btn-secondary aucctus-text-secondary'
          onClick={onSave}
        >
          Save
        </button>
        <button
          disabled={!hasSelections}
          className='btn btn-primary'
          onClick={onContinue}
        >
          Generate {selectedCount === 1 ? 'Report' : 'Reports'}
        </button>
      </div>
    </div>
  );
};

export default SelectedConceptFooter;
