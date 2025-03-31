import { Icon } from '@components';
import React from 'react';

interface ConceptSelectionHeaderProps {
  onClose: () => void;
}

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

export default ConceptSelectionHeader;
