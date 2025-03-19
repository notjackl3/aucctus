import React from 'react';
import { IGeneratedConcept } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { Input } from '@components';

interface SelectableConceptProps {
  isActive: boolean;
  isSelected: boolean;
  concept: IGeneratedConcept;
  onClick: () => void;
}

const SelectableConcept: React.FC<SelectableConceptProps> = ({
  isActive,
  isSelected,
  concept,
  onClick,
}) => {
  return (
    <div
      key={concept.uuid}
      className={cn(
        'flex cursor-pointer flex-col gap-2 rounded-xl p-4 transition-all duration-300',
        isActive && 'aucctus-bg-primary border-brand-primary border-2',
        !isActive && 'aucctus-bg-secondary-hover border-2 border-transparent',
      )}
      onClick={onClick}
    >
      <div className='flex flex-row gap-2'>
        <span className='aucctus-text-brand-primary aucctus-text-md-semibold'>
          {concept.title}
        </span>
        <span className='flex flex-1'></span>
        <Input.CheckBox checked={isSelected} onChange={() => {}} />
      </div>
      <div className='flex flex-row items-center justify-center gap-2'>
        <span className='aucctus-text-secondary aucctus-text-sm'>
          {concept.summary}
        </span>
      </div>
    </div>
  );
};

export default SelectableConcept;
