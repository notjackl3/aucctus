import { Copy } from 'lucide-react';
import React from 'react';

interface ConceptInputsHeaderProps {
  onDuplicateSeed: () => void;
  isDuplicatingSeed: boolean;
  showActions: boolean;
}

const ConceptInputsHeader: React.FC<ConceptInputsHeaderProps> = ({
  onDuplicateSeed,
  isDuplicatingSeed,
  showActions,
}) => {
  return (
    <div className='flex items-start justify-between gap-4'>
      <div>
        <h2 className='aucctus-text-xl-semibold aucctus-text-primary tracking-tight'>
          Concept Inputs
        </h2>
        <p className='aucctus-text-secondary mt-1 text-base'>
          The original inputs and research that shaped this concept.
        </p>
      </div>
      {showActions && (
        <div className='flex shrink-0 items-center gap-1.5'>
          <button
            onClick={onDuplicateSeed}
            disabled={isDuplicatingSeed}
            className='aucctus-text-secondary aucctus-border-secondary aucctus-bg-primary-hover flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors'
          >
            <Copy className='h-3.5 w-3.5' />
            <span>
              {isDuplicatingSeed ? 'Duplicating...' : 'Duplicate Seed'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ConceptInputsHeader;
